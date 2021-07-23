import {Dimensions, PixelRatio} from 'react-native';

let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;

const wp = (widthPercent: string | number)  => {
    const elemWidth =
        typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};
const hp = (heightPercent: string | number) => {
    const elemHeight =
        typeof heightPercent === 'number'
            ? heightPercent
            : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};
 
const orLi = (that: any) => {
    Dimensions.addEventListener('change', (newDimensions) => {
        screenWidth = newDimensions.window.width;
        screenHeight = newDimensions.window.height;
        that.setState({
            orientation: screenWidth < screenHeight ? 'portrait' : 'landscape',
        });
    });
};

const orRe = () => {
    Dimensions.removeEventListener('change', () => {});
};




export {wp, hp, orLi, orRe};