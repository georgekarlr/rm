/*
  # Terminate Lease Function

  1. Function Purpose
    - Terminates an active lease agreement
    - Updates lease status to 'terminated'
    - Logs the termination action
    - Handles asset status updates
    - Validates permissions and lease state

  2. Parameters
    - p_lease_id: The ID of the lease to terminate
    - p_username: The username of the admin performing the action

  3. Security
    - Validates user permissions (admin/leaser only)
    - Ensures lease exists and is in terminable state
    - Logs all termination actions for audit trail

  4. Business Rules
    - Only active leases can be terminated
    - Asset status is updated to 'AVAILABLE' when lease is terminated
    - Outstanding balances are preserved for collection
    - Termination date is recorded as current timestamp
*/

CREATE OR REPLACE FUNCTION public.terminate_lease(
    p_lease_id BIGINT,
    p_username TEXT -- The username of the admin performing the action
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lease_record RECORD;
    v_user_type TEXT;
    v_asset_id BIGINT;
    v_renter_name TEXT;
    v_asset_name TEXT;
    v_termination_date TIMESTAMPTZ;
BEGIN
    -- Set termination date
    v_termination_date := NOW();
    
    -- Log the termination attempt
    INSERT INTO public.rm_logs (action, details, username, created_at)
    VALUES (
        'TERMINATE_LEASE_ATTEMPT',
        jsonb_build_object(
            'lease_id', p_lease_id,
            'username', p_username,
            'timestamp', v_termination_date
        ),
        p_username,
        v_termination_date
    );

    -- Validate input parameters
    IF p_lease_id IS NULL OR p_lease_id <= 0 THEN
        RETURN QUERY SELECT FALSE, 'Invalid lease ID provided';
        RETURN;
    END IF;

    IF p_username IS NULL OR TRIM(p_username) = '' THEN
        RETURN QUERY SELECT FALSE, 'Username is required for lease termination';
        RETURN;
    END IF;

    -- Get user type for permission validation
    SELECT user_type INTO v_user_type
    FROM public.rm_users 
    WHERE name = p_username;

    -- Validate user permissions (only admin and leaser can terminate leases)
    IF v_user_type IS NULL THEN
        RETURN QUERY SELECT FALSE, 'User not found in the system';
        RETURN;
    END IF;

    IF v_user_type NOT IN ('admin', 'leaser') THEN
        RETURN QUERY SELECT FALSE, 'Only admin and leaser users can terminate leases';
        RETURN;
    END IF;

    -- Check if lease exists and get lease details
    SELECT 
        l.*,
        r.first_name || ' ' || COALESCE(r.middle_name || ' ', '') || r.last_name as renter_full_name,
        ra.name as asset_name
    INTO v_lease_record
    FROM public.leases l
    LEFT JOIN public.renters r ON l.renter_id = r.id
    LEFT JOIN public.rentable_assets ra ON l.asset_id = ra.id
    WHERE l.id = p_lease_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Lease not found with the provided ID';
        RETURN;
    END IF;

    -- Store asset and renter info for logging
    v_asset_id := v_lease_record.asset_id;
    v_renter_name := v_lease_record.renter_full_name;
    v_asset_name := v_lease_record.asset_name;

    -- Validate lease status (only active leases can be terminated)
    IF v_lease_record.lease_status != 'active' THEN
        RETURN QUERY SELECT FALSE, 
            'Only active leases can be terminated. Current status: ' || v_lease_record.lease_status;
        RETURN;
    END IF;

    -- Validate lease dates (cannot terminate a lease that hasn't started)
    IF v_lease_record.start_date > v_termination_date THEN
        RETURN QUERY SELECT FALSE, 
            'Cannot terminate a lease that has not started yet. Start date: ' || 
            v_lease_record.start_date::TEXT;
        RETURN;
    END IF;

    -- Check if lease is already expired
    IF v_lease_record.end_date < v_termination_date THEN
        RETURN QUERY SELECT FALSE, 
            'Lease has already expired on ' || v_lease_record.end_date::TEXT || 
            '. Use lease renewal or amendment instead.';
        RETURN;
    END IF;

    BEGIN
        -- Update lease status to terminated
        UPDATE public.leases 
        SET 
            lease_status = 'terminated',
            end_date = v_termination_date, -- Set actual termination date
            updated_at = v_termination_date
        WHERE id = p_lease_id;

        -- Update asset status to available (if asset still exists)
        IF v_asset_id IS NOT NULL THEN
            UPDATE public.rentable_assets 
            SET 
                status = 'AVAILABLE',
                updated_at = v_termination_date
            WHERE id = v_asset_id;
        END IF;

        -- Log successful termination
        INSERT INTO public.rm_logs (action, details, username, created_at)
        VALUES (
            'LEASE_TERMINATED',
            jsonb_build_object(
                'lease_id', p_lease_id,
                'asset_id', v_asset_id,
                'asset_name', v_asset_name,
                'renter_name', v_renter_name,
                'original_end_date', v_lease_record.end_date,
                'termination_date', v_termination_date,
                'outstanding_balance', v_lease_record.outstanding_balance,
                'overdue_balance', v_lease_record.overdue_balance,
                'terminated_by', p_username,
                'user_type', v_user_type
            ),
            p_username,
            v_termination_date
        );

        -- Return success message
        RETURN QUERY SELECT TRUE, 
            'Lease terminated successfully. Asset "' || COALESCE(v_asset_name, 'Unknown') || 
            '" is now available for new leases. Renter: ' || COALESCE(v_renter_name, 'Unknown');

    EXCEPTION WHEN OTHERS THEN
        -- Log the error
        INSERT INTO public.rm_logs (action, details, username, created_at)
        VALUES (
            'LEASE_TERMINATION_ERROR',
            jsonb_build_object(
                'lease_id', p_lease_id,
                'error_message', SQLERRM,
                'error_state', SQLSTATE,
                'username', p_username
            ),
            p_username,
            v_termination_date
        );

        -- Return error message
        RETURN QUERY SELECT FALSE, 
            'Failed to terminate lease: ' || SQLERRM;
    END;

END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.terminate_lease(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.terminate_lease(BIGINT, TEXT) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION public.terminate_lease(BIGINT, TEXT) IS 
'Terminates an active lease agreement and updates asset availability. Only admin and leaser users can terminate leases. Logs all actions for audit trail.';