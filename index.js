const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
// Ваш токен бота
const token = '6404541889:AAGsyDJs7tIrgKjZ3T1EkFgw3BtCy8NVnTU';

// Создание экземпляра бота
const bot = new TelegramBot(token, { polling: true });

const products = [
    { id: 1, name: 'Соль-pvp 0.3г (кристал белый) - 1400 ₽', price: 1400 },
    { id: 2, name: 'Соль-pvp 1г (кристал белый) - 2900 ₽', price: 2900 },
    { id: 3, name: 'Соль-pvp 2г (кристал белый) - 4899 ₽', price: 4899 },
    { id: 4, name: 'Бошки АК-47 25% thc  0.5г - 1350 ₽', price: 1350 },
    { id: 5, name: 'Бошки АК-47 25% thc  1г - 1999 ₽', price: 1999 },
    { id: 6, name: 'Бошки АК-47 25% thc  10г - 8999 ₽', price: 8999 },
    { id: 7, name: 'Мефедрон crystal 0.5 г - 1999 ₽', price: 1999 },
    { id: 8, name: 'Мефедрон crystal 1г - 2999 ₽', price: 2999 },
    { id: 9, name: 'Мефедрон crystal 2г - 4900 ₽', price: 4900 },
    { id: 10, name: 'Гашиш (ice) 0.5г - 1300 ₽', price: 1300 },
    { id: 11, name: 'Гашиш (ice) 1г - 1999 ₽', price: 1999 },
    { id: 12, name: 'Гашиш (ice) 3г - 4000 ₽', price: 4000 },
    { id: 13, name: 'Героин VHQ 0.5г - 1999 ₽', price: 1999 },
    { id: 14, name: 'Героин VHQ 1 г - 2700 ₽', price: 2700 },
    { id: 15, name: 'Метадон 0.5г - 2400 ₽', price: 2400 },
    { id: 16, name: 'Метадон 1г - 3999 ₽', price: 3999 },
    { id: 17, name: 'Alpha pVp ck 0.10г - 900 ₽', price: 900 },
    { id: 18, name: 'Alpha pVp ck 0.5г - 1400 ₽', price: 1400 },
    { id: 19, name: 'Alpha pVp ck 1г - 2400 ₽', price: 2400 },
    { id: 20, name: 'Alpha pVp ck 3г - 5400 ₽', price: 5400 }
];

// Корзина пользователя
const cart = new Map();

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `® ДОБРО ПОЖАЛОВАТЬ В Swag Shop\n\n👉 Преимущества нашего сервиса:\n\n💲Бот автопродаж и оператор работают 24/7.\n❗  Выгодные цены и высочайшее качество товара.\n\n❗️В бота были добавлены только РФ города.\nгорода/села/пгт уточняйте у админа❗️ @swag_admin`;
    bot.sendMessage(chatId, welcomeMessage);
});

// Обработчик текстовых сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'ㅤ');
});

// Функция для отправки главного меню
function sendMainMenu(chatId) {
    bot.sendMessage(chatId, 'Выберите действие:', {
        reply_markup: {
            keyboard: [
                ['Каталог товаров 📦'],
                ['Корзина 🛒', 'Поддержка 🛠️'],
                ['🏙Доступные Города'],
                ['Отзывы 🌟'],
                ['Оплатить товар 💳']
            ],
            resize_keyboard: true
        }
    });
}

// Обработчик кнопок главного меню
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
        case 'Каталог товаров 📦':
            sendProductCatalog(chatId);
            break;
        case 'Корзина 🛒':
            sendCart(chatId);
            break;
        case 'Поддержка 🛠️':
            bot.sendMessage(chatId, 'Здесь вы можете задать вопросы о нашем магазине.');
            break;
        case '🏙Доступные Города':
            sendAvailableCities(chatId);
            break;
        case 'Отзывы 🌟':
            openReviewsChannel(chatId);
            break;
        case 'Оплатить товар 💳':
            sendPaymentOptions(chatId);
            break;
        default:
            break;
    }
});

// Функция для отправки списка доступных городов
function sendAvailableCities(chatId) {
    fs.readFile('cities.txt', 'utf8', (err, data) => {
        if (err) {
            bot.sendMessage(chatId, 'Извините, произошла ошибка при загрузке списка городов.');
            console.error(err);
            return;
        }
        bot.sendMessage(chatId, data);
    });
}

// Функция для отправки каталога товаров
function sendProductCatalog(chatId) {
    bot.sendMessage(chatId, 'Выберите товар из каталога:', {
        reply_markup: {
            inline_keyboard: products.map(product => [{ text: `${product.name} 🛒`, callback_data: product.id.toString() }])
        }
    });
}

// Функция для добавления товара в корзину
function addToCart(chatId, productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        if (!cart.has(chatId)) {
            cart.set(chatId, []);
        }
        cart.get(chatId).push(product);
        return true;
    } else {
        return false;
    }
}

// Обработчик callback данных (нажатий на кнопки товаров)
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const productId = parseInt(callbackQuery.data);

    if (addToCart(chatId, productId)) {
        bot.answerCallbackQuery(callbackQuery.id, { text: `${products.find(p => p.id === productId).name} добавлен в корзину! 🛒` });
    } else {
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Извините, такого товара нет.' });
    }
});

// Функция для отправки содержимого корзины с подсчётом общей стоимости
function sendCart(chatId) {
    if (cart.has(chatId) && cart.get(chatId).length > 0) {
        let totalAmount = 0;
        const cartItems = cart.get(chatId).map(item => {
            totalAmount += item.price; // Учитываем цену товара в общей сумме
            return `${item.name} - ${item.price} ₽`; // Отправляем название и цену товара
        }).join('\n');

        bot.sendMessage(chatId, `Ваша текущая корзина:\n${cartItems}\n\nОбщая сумма: ${totalAmount} ₽`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Оплатить товар 💳', callback_data: 'pay' }],
                    [{ text: 'Очистить корзину ❌', callback_data: 'clear_cart' }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Ваша корзина пуста.');
    }
}

// Функция для отправки вариантов оплаты
function sendPaymentOptions(chatId) {
    bot.sendMessage(chatId, '*❗ При Переводе Стредств или делайте скриншоты, или запись экрана (ОБЯЗАТЕЛЬНО❗) \n ❗ Внимание оплата доступна только в криптовалюте Usdt, NotCoin, TonCoin, Ethereum, Bitcoin*', {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '💸 USDT', callback_data: 'usdt' }],
                [{ text: '💳 NotCoin', callback_data: 'notcoin' }],
                [{ text: '💰 TonCoin', callback_data: 'toncoin' }],
                [{ text: '🪙 Ethereum', callback_data: 'ethereum' }],
                [{ text: '₿ Bitcoin', callback_data: 'bitcoin' }],
                [{ text: '✅ Я ОПЛАТИЛ ✅', callback_data: 'paid' }]
            ]
        }
    });
}

// Функция для открытия канала с отзывами
function openReviewsChannel(chatId) {
    bot.sendMessage(chatId, 'Отзывы нашего магазина вы можете почитать в нашем Telegram канале:\nhttps://t.me/tgspilnota');
}

// Обработчик callback данных для кнопок корзины и оплаты
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    switch (action) {
        case 'pay':
            if (cart.has(chatId) && cart.get(chatId).length > 0) {
                sendPaymentOptions(chatId);
            } else {
                bot.sendMessage(chatId, 'Ваша корзина пуста. Добавьте товары в корзину, чтобы продолжить.');
            }
            break;
        case 'clear_cart':
            cart.delete(chatId);
            bot.sendMessage(chatId, 'Ваша корзина очищена.');
            break;
        case 'usdt':
            bot.sendMessage(chatId, '*💸 USDT СЕТЬ TRC20* - TRUcVxci54S3XcfXMbNYNPi91NJVGiUxwX\n*💸 USDT СЕТЬ TON* - EQD5vcDeRhwaLgAvralVC7sJXI-fc2aNcMUXqcx-BQ-OWnOZ ❗( ОБЯЗАТЕЛЬНО УКАЗАТЬ ТЕГ/MEMO - 8628751 )\n*💸 USDT СЕТЬ ERC20* - 0x71395ca83d85ad7c38df7c44c807d0ec36b69771', { parse_mode: 'Markdown' });
            break;
        case 'notcoin':
            bot.sendMessage(chatId, '*💳 NotCoin СЕТЬ TON* - EQD5vcDeRhwaLgAvralVC7sJXI-fc2aNcMUXqcx-BQ-OWnOZ ❗( ОБЯЗАТЕЛЬНО УКАЗАТЬ ТЕГ/MEMO - 8628751 )', { parse_mode: 'Markdown' });
            break;
        case 'toncoin':
            bot.sendMessage(chatId, '*💰 TonCoin СЕТЬ TON* - EQD5vcDeRhwaLgAvralVC7sJXI-fc2aNcMUXqcx-BQ-OWnOZ ❗( ОБЯЗАТЕЛЬНО УКАЗАТЬ ТЕГ/MEMO - 8628751 )', { parse_mode: 'Markdown' });
            break;
        case 'ethereum':
            bot.sendMessage(chatId, '*🪙 Ethereum СЕТЬ ERC20* - 0x71395ca83d85ad7c38df7c44c807d0ec36b69771', { parse_mode: 'Markdown' });
            break;
        case 'bitcoin':
            bot.sendMessage(chatId, '*₿ Bitcoin СЕТЬ Bitcoin* - 3NSP4iy1t59jE2z2TBdEZohVVhAhAGHxAC', { parse_mode: 'Markdown' });
            break;
        case 'paid':
            bot.sendMessage(chatId, 'Отлично, Напишите администратору! @Adm_Solaris \n [ ❗ ВЫ ДОЛЖНЫ БУДЕТЕ СКИНУТЬ СКРИНШОТ/ВИДЕО ОПЛАТЫ ДЛЯ БЫСТРОГО ПОЛУЧЕНИЯ ТОВАРА ❗❗❗ ]');
            break;
        default:
            break;
    }
});

console.log('Бот успешно запущен');