const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(err);
    });
};

const generateScreenshotWithWatermark = async (screenshot: string): Promise<string | undefined> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
        const img = await loadImage(screenshot);

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const logo = await loadImage("/assets/images/Logo.png");

        ctx.drawImage(
            logo,
            canvas.width - logo.width * 0.25,
            canvas.height - logo.height * 0.25,
            logo.width * 0.2,
            logo.height * 0.2
        );

        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#3D92CE";
        ctx.fillText(
            "Optispace",
            canvas.width - logo.width * 0.25 + logo.width * 0.2 * 0.5 - ctx.measureText("Optispace").width * 0.5,
            canvas.height - logo.height * 0.25 + logo.height * 0.2 + 20
        );

        screenshot = canvas.toDataURL("png");

        canvas.remove();

        return screenshot;
    }

    return undefined;
};

export { loadImage, generateScreenshotWithWatermark };
