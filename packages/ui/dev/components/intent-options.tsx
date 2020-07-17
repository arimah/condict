import {Intent} from '../../src';

const IntentOptions = [
  {value: Intent.PRIMARY, name: 'primary'},
  {value: Intent.SECONDARY, name: 'secondary'},
  {value: Intent.DANGER, name: 'danger'},
] as const;

export default IntentOptions;
