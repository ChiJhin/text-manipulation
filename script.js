const inputText = document.getElementById('inputText');
const applyButton = document.getElementById('applyText');
const outputText = document.getElementById('outputText');
let selectedChars = [];
let draggedChar = null;
let startX, startY;
let isSelecting = false;
let selectionRect = null;

// Apply input text to the output div
applyButton.addEventListener('click', () => {
    outputText.innerHTML = '';
    const text = inputText.value.split('');
    text.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('char');
        span.dataset.index = index;
        outputText.appendChild(span);
    });
    addCharEventListeners();
});

function addCharEventListeners() {
    const chars = document.querySelectorAll('.char');
    chars.forEach(char => {
        char.addEventListener('click', (event) => {
            if (event.ctrlKey) {
                // Toggle selection on ctrl + click
                char.classList.toggle('selected');
                if (char.classList.contains('selected')) {
                    selectedChars.push(char);
                } else {
                    selectedChars = selectedChars.filter(c => c !== char);
                }
            }
        });

        char.addEventListener('mousedown', (event) => {
            if (!event.ctrlKey && selectedChars.length === 0) {
                // Start dragging single character
                draggedChar = char;
                startX = event.clientX - char.offsetLeft;
                startY = event.clientY - char.offsetTop;
                char.classList.add('dragging', 'absolute');
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', onDrop);
            }
        });
    });
}

function onDrag(event) {
    if (draggedChar) {
        draggedChar.style.left = `${event.pageX - startX }px`  ;
        draggedChar.style.top = `${event.pageY - startY }px`  ;
    }
}

function onDrop() {
    if (draggedChar) {
        draggedChar.classList.remove('dragging');
        draggedChar = null;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDrop);
    }
}

// Rectangle selection by mouse dragging
outputText.addEventListener('mousedown', (event) => {
    if (!event.ctrlKey && event.target === outputText) {
        // Start rectangle selection
        isSelecting = true;
        selectionRect = document.createElement('div');
        selectionRect.classList.add('selection-rect');
        selectionRect.style.position = 'absolute';
        selectionRect.style.border = '1px dashed black';
        selectionRect.style.background = 'rgba(0, 0, 0, 0.1)';
        outputText.appendChild(selectionRect);
        startX = event.pageX;
        startY = event.pageY;
        selectionRect.style.left = `${startX- 8}px` ;
        selectionRect.style.top = `${startY - 48}px`;

        document.addEventListener('mousemove', onMouseMoveSelect);
        document.addEventListener('mouseup', onMouseUpSelect);
    }
});

function onMouseMoveSelect(event) {
    if (isSelecting && selectionRect) {
        const currentX = event.pageX;
        const currentY = event.pageY;

        selectionRect.style.left = `${Math.min(startX, currentX)- 8}px`;
        selectionRect.style.top = `${Math.min(startY, currentY) - 48}px`;
        selectionRect.style.width = `${Math.abs(currentX - startX)}px`;
        selectionRect.style.height = `${Math.abs(currentY - startY)}px`;

        // Highlight characters within the rectangle
        const chars = document.querySelectorAll('.char');
        chars.forEach(char => {
            const charRect = char.getBoundingClientRect();
            const selectionRectBounds = selectionRect.getBoundingClientRect();

            if (
                charRect.left < selectionRectBounds.right &&
                charRect.right > selectionRectBounds.left &&
                charRect.top < selectionRectBounds.bottom &&
                charRect.bottom > selectionRectBounds.top
            ) {
                char.classList.add('selected');
                if (!selectedChars.includes(char)) {
                    selectedChars.push(char);
                }
            } else {
                char.classList.remove('selected');
                selectedChars = selectedChars.filter(c => c !== char);
            }
        });
    }
}

function onMouseUpSelect() {
    if (isSelecting) {
        isSelecting = false;
        if (selectionRect) {
            outputText.removeChild(selectionRect);
            selectionRect = null;
        }
        document.removeEventListener('mousemove', onMouseMoveSelect);
        document.removeEventListener('mouseup', onMouseUpSelect);
    }
}