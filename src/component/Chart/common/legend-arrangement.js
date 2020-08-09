const legendHeight = (decoratorHeight, legendData) => decoratorHeight * 2 * legendData.length - decoratorHeight
/**
 * Legend1
 * Legend2
 * Legend3
 * Legend4
 */
const atRight = {
    legendX: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => chartWidth + 25,
    legendY: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => index * decoratorHeight * 2 + chartHeight / 2 - legendHeight(decoratorHeight, legendData) / 2
}

/**
 * Legend1  legend2
 * 
 * legend3  legend4
 */
// const atBottom = {
//     legendX: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => index % 2 === 0 ? 0 + chartWidth / 2 * .2 : chartWidth / 2 + chartWidth / 2 * .2,
//     legendY: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => Math.ceil((index + 1) / 2) * decoratorHeight * 2 + chartHeight + 30
// }

/**
 * Legend1  legend3
 * 
 * legend2  legend4
 */
const atBottom = {
    legendX: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => {
        let rowsCount = Math.ceil(legendData.length / 2)
        let columnIndex = Math.floor(index / rowsCount)
        return columnIndex === 0 ? 0 + chartWidth / 2 * .2 : chartWidth / 2 + chartWidth / 2 * .2
    },
    legendY: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => {
        let rowsCount = Math.ceil(legendData.length / 2)
        let remain = (index + 1) % rowsCount
        return chartHeight + 40 + (
            remain === 0 ? decoratorHeight * 2 * (rowsCount - 1) : decoratorHeight * 2 * (remain - 1)
        )
    }
}

export const legendPresetArrangement = {
    'right': atRight,
    'bottom': atBottom
} 