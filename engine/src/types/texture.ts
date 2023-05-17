/**
 * Texture for objects like walls.
 */
export interface Texture {
    /**
     * The path to the texture image
     */
    url: string,
    /**
     * Can the texture stretch? If not it will be repeated
     */
    stretch: boolean,
    /**
     * The scale value using which the number of repetitions of the texture image is calculated
     */
    scale: number
}

export default Texture;
