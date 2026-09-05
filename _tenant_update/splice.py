import io, sys

def read(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def write(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

route_path = "app/api/whatsapp-demo/route.js"
dropdown_path = "components/InteractiveWebDemo.js"

map_entries = read("_tenant_update/map_entries.txt")
knowledge_blocks = read("_tenant_update/knowledge_blocks.txt")
dropdown_entries = read("_tenant_update/dropdown_entries.txt")

route = read(route_path)

# 1. Insert into companiesMap, right before the 'agency' line
anchor1 = "  'agency': 'ScienceThoughts AI Agency'"
assert route.count(anchor1) == 1, f"anchor1 count = {route.count(anchor1)}"
route = route.replace(anchor1, map_entries + anchor1, 1)

# 2. Insert new else-if blocks right before the final fallback else block
anchor2 = "  } else {\n    // ScienceThoughts AI Agency default"
assert route.count(anchor2) == 1, f"anchor2 count = {route.count(anchor2)}"
route = route.replace(anchor2, knowledge_blocks + anchor2, 1)

write(route_path, route)

dropdown = read(dropdown_path)
anchor3 = '    "55": "Jehan Numa Palace (Bhopal Heritage Palace)"\n  };'
assert dropdown.count(anchor3) == 1, f"anchor3 count = {dropdown.count(anchor3)}"
replacement3 = '    "55": "Jehan Numa Palace (Bhopal Heritage Palace)",\n' + dropdown_entries + '  };'
dropdown = dropdown.replace(anchor3, replacement3, 1)
write(dropdown_path, dropdown)

print("OK: route.js and InteractiveWebDemo.js updated successfully.")
