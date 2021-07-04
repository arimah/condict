import {ForwardRefExoticComponent, RefAttributes} from 'react';

export interface Section {
  readonly key: string;
  readonly icon: JSX.Element;
  readonly content: SectionComponent;
}

export type SectionComponent = ForwardRefExoticComponent<
  RefAttributes<SectionHandle>
>;

export interface SectionHandle {
  readonly canLeave: (() => Promise<boolean>) | boolean;
}
