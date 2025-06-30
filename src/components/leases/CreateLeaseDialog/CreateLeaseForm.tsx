import React from 'react';
import { Alert } from '../../ui/Alert';
import { AssetSelection } from './AssetSelection';
import { RenterSelection } from './RenterSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ChargeConfiguration } from './ChargeConfiguration';
import { IntervalsList } from './IntervalsList';
import { LeasePreview } from './LeasePreview';
import { HelpText } from './HelpText';
import type { CreateLeaseFormData, AssetOption, RenterOption } from './types';
import type { AssetType } from '../../../hooks/useAssetTypes';

interface CreateLeaseFormProps {
  formData: CreateLeaseFormData;
  onFormDataChange: (data: Partial<CreateLeaseFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  assetTypes: AssetType[];
  availableAssets: AssetOption[];
  activeRenters: RenterOption[];
  assetsLoading: boolean;
  rentersLoading: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

export function CreateLeaseForm({
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  assetTypes,
  availableAssets,
  activeRenters,
  assetsLoading,
  rentersLoading,
  message
}: CreateLeaseFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const handleCustomPeriodChange = (field: 'minutes' | 'hours' | 'days', value: number) => {
    const currentCustom = formData.customChargePeriod || { minutes: 0, hours: 0, days: 0 };
    onFormDataChange({
      customChargePeriod: {
        ...currentCustom,
        [field]: value
      }
    });
  };

  const selectedAsset = availableAssets.find(asset => asset.id.toString() === formData.assetId);
  const selectedRenter = activeRenters.find(renter => renter.id.toString() === formData.renterId);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Asset Selection */}
      <AssetSelection
        formData={formData}
        assetTypes={assetTypes}
        availableAssets={availableAssets}
        selectedAsset={selectedAsset}
        assetsLoading={assetsLoading}
        submitting={submitting}
        onChange={handleInputChange}
      />

      {/* Renter Selection */}
      <RenterSelection
        formData={formData}
        activeRenters={activeRenters}
        selectedRenter={selectedRenter}
        rentersLoading={rentersLoading}
        submitting={submitting}
        onChange={handleInputChange}
      />

      {/* Date and Time Selection */}
      <DateTimeSelection
        formData={formData}
        submitting={submitting}
        onChange={handleInputChange}
      />

      {/* Charge Configuration */}
      <ChargeConfiguration
        formData={formData}
        submitting={submitting}
        onChange={handleInputChange}
        onCustomPeriodChange={handleCustomPeriodChange}
      />

      {/* Intervals List */}
      <IntervalsList
        formData={formData}
        submitting={submitting}
      />

      {/* Lease Preview */}
      <LeasePreview
        formData={formData}
        selectedAsset={selectedAsset}
        selectedRenter={selectedRenter}
      />

      {/* Message */}
      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      {/* Help Text */}
      <HelpText />
    </form>
  );
}