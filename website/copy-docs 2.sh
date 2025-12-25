#!/bin/bash
echo "📚 Copying documentation files..."
SRC="../docs"
DEST="./docs"
mkdir -p "$DEST"

add_frontmatter() {
    local file=$1
    local title=$2
    local position=$3
    echo "---"
    echo "sidebar_position: $position"
    echo "title: $title"
    echo "---"
    echo ""
    cat "$file"
}

add_frontmatter "$SRC/SETUP.md" "Setup Guide" 2 > "$DEST/setup.md"
add_frontmatter "$SRC/DEPLOYMENT.md" "Deployment" 3 > "$DEST/deployment.md"
add_frontmatter "$SRC/ARCHITECTURE.md" "Architecture" 4 > "$DEST/architecture.md"
add_frontmatter "$SRC/DATABASE.md" "Database" 5 > "$DEST/database.md"
add_frontmatter "$SRC/SERVICES.md" "Services" 6 > "$DEST/services.md"
add_frontmatter "$SRC/COMPONENTS.md" "Components" 7 > "$DEST/components.md"
add_frontmatter "$SRC/FEATURES.md" "Features" 8 > "$DEST/features.md"
add_frontmatter "$SRC/SCREENS.md" "Screens" 9 > "$DEST/screens.md"
add_frontmatter "$SRC/API.md" "API Reference" 10 > "$DEST/api.md"
add_frontmatter "$SRC/TESTING.md" "Testing" 11 > "$DEST/testing.md"
add_frontmatter "$SRC/TROUBLESHOOTING.md" "Troubleshooting" 12 > "$DEST/troubleshooting.md"
add_frontmatter "$SRC/CONTRIBUTING.md" "Contributing" 13 > "$DEST/contributing.md"

echo "---" > "$DEST/security.md"
echo "sidebar_position: 14" >> "$DEST/security.md"
echo "title: Security" >> "$DEST/security.md"
echo "---" >> "$DEST/security.md"
echo "" >> "$DEST/security.md"
cat ../SECURITY.md >> "$DEST/security.md"

echo "---" > "$DEST/changelog.md"
echo "sidebar_position: 15" >> "$DEST/changelog.md"
echo "title: Changelog" >> "$DEST/changelog.md"
echo "---" >> "$DEST/changelog.md"
echo "" >> "$DEST/changelog.md"
cat ../CHANGELOG.md >> "$DEST/changelog.md"

echo "✅ Documentation files copied successfully!"
ls -lh "$DEST"
