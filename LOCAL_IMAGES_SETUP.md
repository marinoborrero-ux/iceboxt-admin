# Local Image Setup

## Image Directory

Create the following directory structure on your server:

```
/var/data/images/
```

## Required Images

Place the following image files in `/var/data/images/`:

### Categories
- `main-courses.jpg`
- `appetizers.jpg`
- `desserts.jpg`
- `beverages.jpg`
- `snacks.jpg`
- `meal-combos.jpg`

### Products
- `grilled-chicken.jpg`
- `steak-chimichurri.jpg`
- `salmon-teriyaki.jpg`
- `pasta-primavera.jpg`
- `quinoa-bowl.jpg`
- `bruschetta.jpg`
- `stuffed-mushrooms.jpg`
- `spring-rolls.jpg`
- `caprese-skewers.jpg`
- `garlic-shrimp.jpg`
- `lava-cake.jpg`
- `tiramisu.jpg`
- `lemon-cheesecake.jpg`
- `iced-tea.jpg`
- `lemonade.jpg`
- `berry-smoothie.jpg`
- `nachos.jpg`
- `potato-wedges.jpg`
- `chicken-wings.jpg`
- `family-combo.jpg`
- `party-combo.jpg`

## API Usage

Images are served via: `/api/images/[filename]`

Example: `/api/images/grilled-chicken.jpg`

## File Permissions

Ensure the image directory and files have proper read permissions:

```bash
chmod 755 /var/data/images
chmod 644 /var/data/images/*.jpg
```