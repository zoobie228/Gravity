const dataVizColorPalette = [
    "#661884",
    "#9553C4",
    "#EAB4FC",
    "#008198",
    "#00C6DF",
    "#8EEFF4",
    "#9EA820",
    "#CDDC39",
    "#E9EF7F",
    "#C0552A",
    "#FC7C42",
    "#FDB390"
]

const colorWithMeaningPalette = {
    MAX: "#28743E",
    MAX30: "#BED5C5",
    MAX15: "#DFEAE2",
    KAI: "#B91224",
    KAI30: "#EAB7BD",
    KAI15: "#F5DCDE",
    LIS: "#FFBC06",
    LEO30: "#FFEAB4",
    LEO15: "#FFF5DA",
    KIT: "#CDCDCD",
    CAL: '#2f749a',
    ELI: '#353535'
}
const purpleShades = ['#e2d2e6', '#c3a5cf', '#a578b6', '#854a9e', '#661884']
const blueShades = ['#D4E5EB', '#ABCDD6', '#7AB3C1', '#4A98AC', '#008198']
const positiveNegativesColors = ['#B91224', '#EAB7BD', '#F5DCDE', '#FFBC06', '#FFEAB4', '#FFF5DA', '#DFEAE2', '#BED5C5', '#28743E']
const treeHeatMapColors = ['#B91224', '#EAB7BD', '#F5DCDE', '#CDCDCD', '#DFEAE2', '#BED5C5', '#28743E']
const darkColorsForTreemap = ['#661884', '#9553C4', '#008198', '#C0552A', '#B91224', '#28743E']

export const DEFAULT_OPACITY = 0.5;
export const DEFAULT_SIZE = 5;
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_COLOR = dataVizColorPalette[0]
export const SIZE_RANGE  = [1,10];
export const DEFAULT_TICK_SIZE  = 7;
export const UN_SELECTED ='#F0F0F0'
export { dataVizColorPalette, colorWithMeaningPalette, purpleShades, blueShades, positiveNegativesColors, treeHeatMapColors, darkColorsForTreemap}