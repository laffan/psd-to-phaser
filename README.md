# PSD to JSON 

Styled off the likes of Tiled, this is an attempt at using PSDs to generate assets and data from a PSD.  The repo is broken down in to three parts.

## Generator

This is a series of python scripts that uses psd_tools to break up the PSD, read positions, attributes, etc and then output a JSON blob with a series of optimized assets.  You can read more about how to use the generator [in its README](./generate/README.md).

## Parser

A few javascript tools to help parse the JSON blob in your project.  Includes helper functions for the Phaser and Fabric libraries to get you off the ground a little more quickly.  Learn more about the parse [in its README](./parser/README.md).

## Demos

An ongoing set of demos that show off what the tool is capable of.
