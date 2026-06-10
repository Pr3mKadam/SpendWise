export type SyncView =
  | 'dashboard'
  | 'select-source'
  | 'upi-link'
  | 'plaid-link'
  | 'rzp-link'
  | 'web3-link'
  | 'ondc-link'
  | 'pay-form'
  | 'pay-parsing'
  | 'pay-success'
  | 'pay-correction'
  | 'csv'
  | 'mandate';

export type WizardStep = 'upi-select' | 'upi-credentials' | 'upi-connecting' | 'upi-success';
