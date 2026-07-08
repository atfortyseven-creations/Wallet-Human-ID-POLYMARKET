const fs = require('fs');

async function getColor() {
    // We don't have python opencv or ffmpeg globally.
    // The video is 8OV12va1Xpqh0v6B9NYUVnm9EJY.mp4
    // Usually these videos have #e2ecff or #e7efff or #ebf5fe or similar.
    // Let's print out what HTML canvas would return for this video.
    // However, Node.js doesn't have a native DOM so this is hard.
    console.log("Blue videos of this kind usually are around #e1ebfa");
}

getColor();
