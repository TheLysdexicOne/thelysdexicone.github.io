// This file contains the JavaScript code for the website. It handles interactivity and dynamic behavior.

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('myButton');
    const output = document.getElementById('output');

    button.addEventListener('click', () => {
        output.textContent = 'Button clicked! Welcome to Ball X Pit Companion!';
    });
});