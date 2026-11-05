import re
import os

def minify_css(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return False
    
    with open(input_path, 'r', encoding='utf-8') as f:
        css = f.read()

    # 1. Remove comments
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    
    # 2. Remove whitespace around symbols
    css = re.sub(r'\s*([\{\};:,])\s*', r'\1', css)
    
    # 3. Collapse multiple whitespaces
    css = re.sub(r'\s+', ' ', css)
    
    # 4. Remove space before {
    css = css.replace(' {', '{')
    
    # 5. Remove semicolon before }
    css = css.replace(';}', '}')
    
    # 6. Trim leading/trailing whitespace
    css = css.strip()

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(css)
    
    orig_size = os.path.getsize(input_path)
    mini_size = len(css.encode('utf-8'))
    
    print(f"Minified {input_path} -> {output_path}")
    print(f"Original size: {orig_size / 1024:.2f} KB")
    print(f"Minified size: {mini_size / 1024:.2f} KB")
    print(f"Reduction: {(1 - mini_size / orig_size) * 100:.1f}%")
    return True

if __name__ == "__main__":
    src = "assets/css/style.css"
    dst = "assets/css/style.min.css"
    minify_css(src, dst)
