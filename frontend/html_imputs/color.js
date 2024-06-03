const form = document.getElementById('gameForm');
        const colorInput = document.getElementById('color');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const pseudo = document.getElementById('pseudo').value;
            const color = colorInput.value;

            console.log(`Pseudo: ${pseudo}`);
            console.log(`Color: ${color}`);

            const data = { pseudo, color };
            
            fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.location.href = `game.html?pseudo=${encodeURIComponent(pseudo)}&color=${encodeURIComponent(color)}`;

            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });