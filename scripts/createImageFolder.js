let fs = require("fs");
const dirs = [
  "./CategoryImages",
  "./ProductImages",
  "./BrandImages",
  "./UserImages",
  "./FlashImages",
  "./temp",
  "./AdImages",
  "./ShopImages",
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`created directory ${dir}`);
  }
});
