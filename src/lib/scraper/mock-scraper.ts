// 1688 Scraper - Mock Scraper for Testing
// Returns realistic fake data when API is not available

import type { Raw1688Product, Raw1688Variant } from './types';

// Generate mock product data from a product ID
export function mockScrapeProduct(productId: string): Raw1688Product {
  // Use product ID to seed random-ish data
  const seed = parseInt(productId.slice(-4)) || 1234;
  
  const products = [
    mockElectronicsProduct(productId, seed),
    mockClothingProduct(productId, seed),
    mockHomeProduct(productId, seed),
    mockAccessoryProduct(productId, seed),
  ];
  
  return products[seed % products.length];
}

function mockElectronicsProduct(productId: string, seed: number): Raw1688Product {
  return {
    productId,
    url: `https://detail.1688.com/offer/${productId}.html`,
    title: '无线蓝牙耳机 TWS降噪运动耳机 高音质立体声',
    titleTranslated: 'Wireless Bluetooth Earbuds TWS Noise Cancelling Sport Headphones Hi-Fi Stereo',
    price: { min: 28 + (seed % 20), max: 45 + (seed % 30), currency: 'CNY' },
    moq: 2,
    images: [
      'https://cbu01.alicdn.com/img/ibank/O1CN01mock001_1.jpg',
      'https://cbu01.alicdn.com/img/ibank/O1CN01mock002_2.jpg',
      'https://cbu01.alicdn.com/img/ibank/O1CN01mock003_3.jpg',
    ],
    mainImage: 'https://cbu01.alicdn.com/img/ibank/O1CN01mock001_1.jpg',
    description: '高品质无线蓝牙耳机，支持降噪功能，适合运动和日常使用。电池续航长达8小时。',
    descriptionTranslated: 'High-quality wireless Bluetooth earbuds with noise cancellation. Perfect for sports and daily use. Battery life up to 8 hours.',
    specifications: {
      '蓝牙版本': '5.3',
      '电池容量': '50mAh (每只耳机)',
      '续航时间': '8小时',
      '充电时间': '1.5小时',
    },
    specificationsTranslated: {
      'Bluetooth Version': '5.3',
      'Battery Capacity': '50mAh (per earbud)',
      'Playback Time': '8 hours',
      'Charging Time': '1.5 hours',
    },
    variants: [
      {
        id: 'color',
        name: '颜色',
        nameTranslated: 'Color',
        type: 'color',
        options: [
          { id: 'c1', value: '黑色', valueTranslated: 'Black', stock: 500 },
          { id: 'c2', value: '白色', valueTranslated: 'White', stock: 350 },
          { id: 'c3', value: '粉色', valueTranslated: 'Pink', stock: 200, priceAdjustment: 5 },
        ],
      },
    ],
    seller: {
      name: '深圳优品电子有限公司',
      id: 'seller_' + seed,
      rating: 4.8,
      yearsOnPlatform: 5,
      location: 'Shenzhen',
    },
    shipping: { weight: 0.15, estimatedDays: 15 },
    scrapedAt: new Date().toISOString(),
  };
}

function mockClothingProduct(productId: string, seed: number): Raw1688Product {
  return {
    productId,
    url: `https://detail.1688.com/offer/${productId}.html`,
    title: '2024新款休闲T恤 纯棉短袖 男女同款 宽松版型',
    titleTranslated: '2024 New Casual T-Shirt Pure Cotton Short Sleeve Unisex Loose Fit',
    price: { min: 18 + (seed % 10), max: 28 + (seed % 15), currency: 'CNY' },
    moq: 5,
    images: [
      'https://cbu01.alicdn.com/img/ibank/O1CN01tshirt01.jpg',
      'https://cbu01.alicdn.com/img/ibank/O1CN01tshirt02.jpg',
    ],
    mainImage: 'https://cbu01.alicdn.com/img/ibank/O1CN01tshirt01.jpg',
    description: '100%纯棉面料，舒适透气。宽松版型适合各种身材。',
    descriptionTranslated: '100% pure cotton fabric, comfortable and breathable. Loose fit suitable for all body types.',
    specifications: { '材质': '100%棉', '厚度': '中等' },
    specificationsTranslated: { 'Material': '100% Cotton', 'Thickness': 'Medium' },
    variants: [
      {
        id: 'color',
        name: '颜色',
        nameTranslated: 'Color',
        type: 'color',
        options: [
          { id: 'c1', value: '黑色', valueTranslated: 'Black', stock: 1000 },
          { id: 'c2', value: '白色', valueTranslated: 'White', stock: 800 },
          { id: 'c3', value: '灰色', valueTranslated: 'Grey', stock: 600 },
        ],
      },
      {
        id: 'size',
        name: '尺寸',
        nameTranslated: 'Size',
        type: 'size',
        options: [
          { id: 's1', value: 'S', valueTranslated: 'S', stock: 300 },
          { id: 's2', value: 'M', valueTranslated: 'M', stock: 500 },
          { id: 's3', value: 'L', valueTranslated: 'L', stock: 400 },
          { id: 's4', value: 'XL', valueTranslated: 'XL', stock: 300 },
        ],
      },
    ],
    seller: {
      name: '广州潮流服饰厂',
      id: 'seller_' + seed,
      rating: 4.6,
      yearsOnPlatform: 8,
      location: 'Guangzhou',
    },
    shipping: { weight: 0.25, estimatedDays: 18 },
    scrapedAt: new Date().toISOString(),
  };
}

function mockHomeProduct(productId: string, seed: number): Raw1688Product {
  return {
    productId,
    url: `https://detail.1688.com/offer/${productId}.html`,
    title: 'LED台灯护眼学习灯 USB充电 触控调光',
    titleTranslated: 'LED Desk Lamp Eye Protection Study Light USB Rechargeable Touch Dimming',
    price: { min: 35 + (seed % 25), max: 55 + (seed % 35), currency: 'CNY' },
    moq: 3,
    images: [
      'https://cbu01.alicdn.com/img/ibank/O1CN01lamp01.jpg',
      'https://cbu01.alicdn.com/img/ibank/O1CN01lamp02.jpg',
    ],
    mainImage: 'https://cbu01.alicdn.com/img/ibank/O1CN01lamp01.jpg',
    description: '护眼LED台灯，三档调光，USB充电。适合学习和办公使用。',
    descriptionTranslated: 'Eye-care LED desk lamp with 3-level dimming and USB charging. Perfect for studying and office work.',
    specifications: { '功率': '5W', '光源类型': 'LED', '电池容量': '2000mAh' },
    specificationsTranslated: { 'Power': '5W', 'Light Source': 'LED', 'Battery': '2000mAh' },
    variants: [
      {
        id: 'color',
        name: '颜色',
        nameTranslated: 'Color',
        type: 'color',
        options: [
          { id: 'c1', value: '白色', valueTranslated: 'White', stock: 200 },
          { id: 'c2', value: '黑色', valueTranslated: 'Black', stock: 150 },
        ],
      },
    ],
    seller: {
      name: '中山照明科技',
      id: 'seller_' + seed,
      rating: 4.7,
      yearsOnPlatform: 6,
      location: 'Zhongshan',
    },
    shipping: { weight: 0.4, estimatedDays: 20 },
    scrapedAt: new Date().toISOString(),
  };
}

function mockAccessoryProduct(productId: string, seed: number): Raw1688Product {
  return {
    productId,
    url: `https://detail.1688.com/offer/${productId}.html`,
    title: '网红爆款手机壳 防摔硅胶保护套 适用iPhone15',
    titleTranslated: 'Trendy Phone Case Shockproof Silicone Cover for iPhone 15',
    price: { min: 8 + (seed % 8), max: 15 + (seed % 10), currency: 'CNY' },
    moq: 10,
    images: [
      'https://cbu01.alicdn.com/img/ibank/O1CN01case01.jpg',
      'https://cbu01.alicdn.com/img/ibank/O1CN01case02.jpg',
    ],
    mainImage: 'https://cbu01.alicdn.com/img/ibank/O1CN01case01.jpg',
    description: '高品质硅胶手机壳，四角加固防摔设计。多种颜色可选。',
    descriptionTranslated: 'High-quality silicone phone case with reinforced corners for drop protection. Multiple colors available.',
    specifications: { '材质': '液态硅胶', '适用机型': 'iPhone 15/15 Pro/15 Pro Max' },
    specificationsTranslated: { 'Material': 'Liquid Silicone', 'Compatible': 'iPhone 15/15 Pro/15 Pro Max' },
    variants: [
      {
        id: 'color',
        name: '颜色',
        nameTranslated: 'Color',
        type: 'color',
        options: [
          { id: 'c1', value: '黑色', valueTranslated: 'Black', stock: 2000 },
          { id: 'c2', value: '白色', valueTranslated: 'White', stock: 1500 },
          { id: 'c3', value: '蓝色', valueTranslated: 'Blue', stock: 1000 },
          { id: 'c4', value: '粉色', valueTranslated: 'Pink', stock: 800 },
          { id: 'c5', value: '绿色', valueTranslated: 'Green', stock: 600 },
        ],
      },
      {
        id: 'model',
        name: '型号',
        nameTranslated: 'Model',
        type: 'other',
        options: [
          { id: 'm1', value: 'iPhone 15', valueTranslated: 'iPhone 15', stock: 1000 },
          { id: 'm2', value: 'iPhone 15 Pro', valueTranslated: 'iPhone 15 Pro', stock: 800 },
          { id: 'm3', value: 'iPhone 15 Pro Max', valueTranslated: 'iPhone 15 Pro Max', stock: 600, priceAdjustment: 2 },
        ],
      },
    ],
    seller: {
      name: '义乌小商品批发',
      id: 'seller_' + seed,
      rating: 4.5,
      yearsOnPlatform: 10,
      location: 'Yiwu',
    },
    shipping: { weight: 0.05, estimatedDays: 12 },
    scrapedAt: new Date().toISOString(),
  };
}

// Simulate API delay
export async function mockScrapeWithDelay(productId: string, delayMs: number = 1500): Promise<Raw1688Product> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return mockScrapeProduct(productId);
}
