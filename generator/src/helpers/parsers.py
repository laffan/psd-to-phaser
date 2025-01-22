import re

def parse_string(value):
    if value.startswith('"') and value.endswith('"'):
        return value[1:-1].replace('\\"', '"')
    else:
        return value.strip()

def parse_array(value):
    if value.startswith('[') and value.endswith(']'):
        elements = []
        current_element = ''
        quote_open = False
        bracket_count = 0
        for char in value[1:-1]:
            if char == ',' and not quote_open and bracket_count == 0:
                elements.append(parse_value(current_element.strip()))
                current_element = ''
            else:
                if char == '"':
                    quote_open = not quote_open
                elif char == '[':
                    bracket_count += 1
                elif char == ']':
                    bracket_count -= 1
                current_element += char
        if current_element:
            elements.append(parse_value(current_element.strip()))
        return elements
    else:
        return [parse_value(v.strip()) for v in value.split(',')]

def parse_object(value):
    if value.startswith('{') and value.endswith('}'):
        obj = {}
        current_key = ''
        current_value = ''
        key_mode = True
        quote_open = False
        for char in value[1:-1]:
            if char == ':' and not quote_open:
                key_mode = False
            elif char == ',' and not quote_open:
                if current_key:
                    obj[current_key.strip()] = parse_value(current_value.strip())
                current_key = ''
                current_value = ''
                key_mode = True
            else:
                if char == '"':
                    quote_open = not quote_open
                if key_mode:
                    current_key += char
                else:
                    current_value += char
        if current_key:
            obj[current_key.strip()] = parse_value(current_value.strip())
        return obj
    else:
        return value

def parse_value(value):
    value = value.strip()
    if not value:
        return None
    if value.startswith('"'):
        return parse_string(value)
    elif value.startswith('['):
        return parse_array(value)
    elif value.startswith('{'):
        return parse_object(value)
    elif value.lower() == 'true':
        return True
    elif value.lower() == 'false':
        return False
    else:
        try:
            return int(value)
        except ValueError:
            try:
                return float(value)
            except ValueError:
                return value

def parse_attributes(layer_name):
    parts = [part.strip() for part in layer_name.split('|')]

    if len(parts) < 2 or len(parts) > 4:
        return None  # Invalid format, ignore this layer

    category_map = {
        'Z': 'zone',
        'P': 'point',
        'S': 'sprite',
        'T': 'tileset',
        'G': 'group'
    }

    category = parts[0].upper()
    if category not in category_map:
        return None  # Invalid category, ignore this layer

    result = {
        'category': category_map[category],
        'name': parts[1]
    }

    if len(parts) == 3:
        attributes = parse_attribute_string(parts[2])
        if attributes:
            result.update(attributes)
    elif len(parts) == 4:
        result['type'] = parts[2]
        attributes = parse_attribute_string(parts[3])
        if attributes:
            result.update(attributes)

    return result

def parse_attribute_string(attr_string):
    attr_string = attr_string.strip()
    if not attr_string:
        return None

    attributes = {}
    for item in re.split(r',\s*(?![^:]*\])', attr_string):
        item = item.strip()
        if ':' in item:
            key, value = map(str.strip, item.split(':', 1))
            if key:
                parsed_value = parse_value(value)
                if parsed_value is not None:
                    attributes[key] = parsed_value
        elif item:  # Standalone attribute (boolean)
            attributes[item] = True

    return attributes if attributes else None