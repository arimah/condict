import AppearanceSection from './appearance-section';
import LanguageSection from './language-section';
import UpdatesSection from './updates-section';
import StorageSection from './storage-section';
import AboutSection from './about-section';
import {Section} from './types';

const AllSections: readonly Section[] = [
  AppearanceSection,
  LanguageSection,
  UpdatesSection,
  StorageSection,
  AboutSection,
];

export default AllSections;
