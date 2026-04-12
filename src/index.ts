/**
 * psd-to-phaser - A Phaser 4 plugin that rebuilds PSD layouts from JSON manifests.
 *
 * Reads JSON output from {@link https://pypi.org/project/psd-to-json/ | psd-to-json},
 * loads the referenced assets, and places them in a Phaser scene preserving the
 * original PSD layer structure, positions, and depth ordering.
 *
 * @packageDocumentation
 */
import PsdToPhaser from './PsdToPhaser';

export default PsdToPhaser;