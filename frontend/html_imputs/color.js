const color = document.querySelector('.colorInput');

/**
 * This function is used to fetch le color picked by the player
 */
color.addEventListener('input', () => {
    console.log(color.value);
});