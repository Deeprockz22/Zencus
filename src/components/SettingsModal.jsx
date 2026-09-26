import React from 'react';
import ClassicSettingsModal from './ClassicSettingsModal';
import AtelierSettingsModal from './AtelierSettingsModal';
import { isArtTheme } from '../themeFamilies';

export { SOUNDTRACK_OPTIONS } from '../utils/soundtracks';

/*
 * Settings follows the theme: the Crisp themes keep the original settings
 * page; the art themes (Surreal, Lantern) get "The Atelier". Both take the
 * same props.
 */
export default function SettingsModal(props) {
  return isArtTheme(props.theme) ? <AtelierSettingsModal {...props} /> : <ClassicSettingsModal {...props} />;
}
