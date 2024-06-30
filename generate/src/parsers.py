
def parse_value(value):
    value = value.strip()
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

def parse_string(value):
    if value.startswith('"') and value.endswith('"'):
        return value[1:-1].replace('\\"', '"')
    else:
        raise ValueError(f"Invalid string format: {value}")

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
        return [value.strip()]
      

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
        raise ValueError(f"Invalid object format: {value}")

      
def parse_attributes(name):
    parts = name.split('|')
    if len(parts) > 2:
        name = parts[0].strip()
        type_info = parts[1].strip()
        attributes = parts[2].strip()
    elif len(parts) > 1:
        name = parts[0].strip()
        type_info = None
        attributes = parts[1].strip()
    else:
        return {"name": name}, {}

    attributes_dict = {}
    current_key = ''
    current_value = ''
    key_mode = True
    quote_open = False
    bracket_count = 0
    brace_count = 0
    
    for char in attributes:
        if char == ':' and not quote_open and bracket_count == 0 and brace_count == 0:
            key_mode = False
        elif char == ',' and not quote_open and bracket_count == 0 and brace_count == 0:
            attributes_dict[current_key.strip()] = parse_value(current_value.strip())
            current_key = ''
            current_value = ''
            key_mode = True
        else:
            if char == '"':
                quote_open = not quote_open
            elif char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
            elif char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
            if key_mode:
                current_key += char
            else:
                current_value += char
    
    if current_key:
        attributes_dict[current_key.strip()] = parse_value(current_value.strip())
    
    name_type_dict = {"name": name}
    if type_info:
        name_type_dict["type"] = type_info
    
    return name_type_dict, attributes_dict
