import io

def read_normalized(p):
    # universal-newline read: translates \r\n and \r to \n
    with io.open(p, "r", encoding="utf-8", newline=None) as f:
        return f.read()

def write_crlf(p, s):
    # s uses \n internally; convert to \r\n on write, no further translation
    s = s.replace("\r\n", "\n").replace("\n", "\r\n")
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)

route_path = "app/api/whatsapp-demo/route.js"
dropdown_path = "components/InteractiveWebDemo.js"

map_entries = read_normalized("_tenant_update/map_entries.txt")
knowledge_blocks = read_normalized("_tenant_update/knowledge_blocks.txt")
dropdown_entries = read_normalized("_tenant_update/dropdown_entries.txt")

route = read_normalized(route_path)

anchor1 = "  'agency': 'ScienceThoughts AI Agency'"
assert route.count(anchor1) == 1, f"anchor1 count = {route.count(anchor1)}"
route = route.replace(anchor1, map_entries + anchor1, 1)

anchor2 = "  } else {\n    // ScienceThoughts AI Agency default"
assert route.count(anchor2) == 1, f"anchor2 count = {route.count(anchor2)}"
route = route.replace(anchor2, knowledge_blocks + anchor2, 1)

write_crlf(route_path, route)

dropdown = read_normalized(dropdown_path)
anchor3 = '    "55": "Jehan Numa Palace (Bhopal Heritage Palace)"\n  };'
assert dropdown.count(anchor3) == 1, f"anchor3 count = {dropdown.count(anchor3)}"
replacement3 = '    "55": "Jehan Numa Palace (Bhopal Heritage Palace)",\n' + dropdown_entries + '  };'
dropdown = dropdown.replace(anchor3, replacement3, 1)
write_crlf(dropdown_path, dropdown)

print("OK v2: CRLF-preserving splice complete.")
