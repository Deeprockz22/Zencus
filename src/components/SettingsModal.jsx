import React from 'react';
import AtelierSettingsModal from './AtelierSettingsModal';

export { SOUNDTRACK_OPTIONS } from '../utils/soundtracks';

/*
 * One settings page for every theme ("The Atelier"), dressed by each theme
 * family in its own palette, type and words (settings-skins.css).
 */
export default function SettingsModal(props) {
  return <AtelierSettingsModal {...props} />;
}
