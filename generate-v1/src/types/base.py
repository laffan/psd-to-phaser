""" src/types/base.py
Defines the base class for all element types in the PSD.

This module provides a common interface and shared functionality
for processing different types of elements (points, sprites, tiles, zones).

Parameters:
  layer (PSDLayer) = PSD layer object to be processed

Returns:
  BaseElement object
"""

from typing import Dict, Any
from psd_tools import PSDLayer

class BaseElement:
    def __init__(self, layer: PSDLayer):
        self.layer = layer
        self.name, self.attributes = self.parse_attributes(layer.name)

    @staticmethod
    def parse_attributes(layer_name: str) -> tuple[str, Dict[str, Any]]:
        # Implementation of parse_attributes goes here
        # This should be moved from the current parsers.py
        pass

    def process(self) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement process method")