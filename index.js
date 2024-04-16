document.getElementById('imageLoader').addEventListener('change', handleImage, false);
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event){
        const img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.style.display = 'block';
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);    
}

function encodeMessage() {
    const message = document.getElementById('messageInput').value + String.fromCharCode(0); // Add a null character to signify end of message
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert the message to binary
    let messageBinary = message.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');

    let dataIndex = 0;
    for (let i = 0; i < messageBinary.length; i++) {
        const value = parseInt(messageBinary[i]);
        data[dataIndex] = (data[dataIndex] & ~1) | value;
        dataIndex += 4; // jump to the next pixel's first channel (assuming RGBA)
    }

    ctx.putImageData(imageData, 0, 0);
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadBtn').onclick = function() {
        const downloadLink = document.createElement('a');
        downloadLink.download = 'encoded-image.png';
        downloadLink.href = canvas.toDataURL();
        downloadLink.click();
    }
}

function decodeMessage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let binaryMessage = '';
    let outputMessage = '';

    // Extract the binary message from the image
    for (let i = 0; i < data.length; i += 4) {
        const lsb = data[i] & 1; // Extract the least significant bit
        binaryMessage += lsb;
        // Check every 8 bits if it forms a valid character
        if (binaryMessage.length === 8) {
            const charCode = parseInt(binaryMessage, 2);
            if (charCode === 0) { // Assuming message is terminated by a null character
                break;
            }
            outputMessage += String.fromCharCode(charCode);
            binaryMessage = ''; // Reset for next character
        }
    }

    alert("Decoded Message: " + outputMessage);
}
