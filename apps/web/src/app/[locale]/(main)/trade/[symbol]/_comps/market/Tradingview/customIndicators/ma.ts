import {
  CustomIndicator,
  IPineStudyResult,
  LibraryPineStudy,
  PineJS,
  RawStudyMetaInfoId,
  StudyInputType,
  StudyPlotType
} from '@/libs/charting_library'

const customerMovingAverage = (PineJS: PineJS) => {
  // 它将由图表库内部使用
  const indicators: CustomIndicator = {
    // 指标的内部名称，在 UI 中不可见。这个名字应该是唯一的。
    name: 'Customer Moving Average',
    metainfo: {
      // _metainfoVersion 属性表示元数据的版本号。当前版本是 51 ，默认版本是 0 。尽管此属性是可选的，但我们建议您始终指定它并使用最新版本。因此，您的指标与新版本的库更加兼容。
      _metainfoVersion: 51,
      // id 属性是具有 <study name>@tv-basicstudies-1 格式的字符串。 id 值应该是唯一的
      id: 'Customer Moving Average@tv-basicstudies-1' as RawStudyMetaInfoId,
      name: 'Customer Moving Average',
      // 描述指标外观的字段。该字段定义表示指标的绘图类型并包含指标的名称、描述、样式、颜色等信息
      // description 属性包含显示在“指标”对话框中的指标名称。如果您使用 createStudy 方法创建指标，则应使用 description 值作为 name 参数。
      description: 'Customer Moving Average', //此说明将显示在指标窗口
      shortDescription: 'MA', // shortDescription 属性包含显示在图表和“设置”对话框中的指标名称
      is_price_study: true, // is_price_study 属性指定指标是否应与主系列显示在同一窗格上。
      // is_hidden_study: false, // 属性允许您在“指标”对话框中隐藏自定义指标。为此，请将此属性设置为 true 。默认值为 false
      isCustomIndicator: true,
      format: {
        type: 'price'
        // Precision is set to one digit, e.g. 777.7
        // precision: 2
      },
      defaults: {
        styles: {
          // https://www.tradingview.com/charting-library-docs/latest/custom_studies/Custom-Studies-Plots
          plot_0: {
            linestyle: 0,
            // 绘图线宽度
            linewidth: 1,
            plottype: 0,
            // 显示价格线?
            trackPrice: false,
            // 绘制透明度，百分比。
            transparency: 35,
            visible: true,
            color: '#FF0000'
          },
          plot_1: {
            linestyle: 0,
            linewidth: 1,
            plottype: 0,
            trackPrice: false,
            transparency: 35,
            visible: true,
            color: '#00FF00'
          },
          plot_2: {
            linestyle: 0,
            linewidth: 1,
            plottype: 0,
            trackPrice: false,
            transparency: 35,
            visible: true,
            color: '#00FFFF'
          }
        },
        inputs: {
          in_0: 5,
          in_1: 10,
          in_2: 30
        },
        // 指标输出值的精度
        // (小数点后的位数)。
        precision: 4
      },
      // plots 属性定义指标所包含的简单元素，例如线条和绘图。请参阅 StudyPlotType 页面以查看所有绘图类型的列表
      // 每个图都需要应在 styles 和 defaults 中指定的附加信息。
      // https://www.tradingview.com/charting-library-docs/latest/custom_studies/Custom-Studies-Plots
      plots: [
        {
          id: 'plot_0',
          type: 'line' as StudyPlotType.Line
        },
        {
          id: 'plot_1',
          type: 'line' as StudyPlotType.Line
        },
        {
          id: 'plot_2',
          type: 'line' as StudyPlotType.Line
        }
      ],
      // styles 属性包含 plots 中定义的每个绘图的样式设置。用户无法在 UI 中更改这些设置
      styles: {
        // 输出的名字将在样式窗口显示
        plot_0: {
          // 鼠标悬浮到5日数值上显示的标题
          title: ''
        },
        plot_1: {
          // 鼠标悬浮到10日数值上显示的标题
          title: ''
        },
        plot_2: {
          // 鼠标悬浮到30日数值上显示的标题
          title: ''
        }
      },
      // https://www.tradingview.com/charting-library-docs/latest/custom_studies/metainfo/Custom-Studies-Inputs
      inputs: [
        {
          id: 'in_0',
          name: 'Length',
          defval: 9, // 默认值
          // bool text symbol resolution session source integer float time
          type: 'integer' as StudyInputType.Integer,
          min: 1,
          max: 1e4
        },
        {
          id: 'in_1',
          name: 'Length1',
          defval: 10,
          type: 'integer' as StudyInputType.Integer,
          min: 1,
          max: 1e4
        },
        {
          id: 'in_2',
          name: 'Length2',
          defval: 30,
          type: 'integer' as StudyInputType.Integer,
          min: 1,
          max: 1e4
        }
      ]
    },
    // 包含函数 init() 和 main() 的字段。您应该在这些函数中指定数据计算
    constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
      this.main = function (context, inputCallback) {
        this._context = context
        this._input = inputCallback
        const i = PineJS.Std['close'](this._context)
        const o = this._input(0)
        const o1 = this._input(1)
        const o2 = this._input(2)
        const r = 0
        const s = this._context.new_var(i)

        const value1 = PineJS.Std.sma(s, o, this._context)
        const value2 = PineJS.Std.sma(s, o1, this._context)
        const value3 = PineJS.Std.sma(s, o2, this._context)

        const result = [
          {
            value: value1,
            offset: r
          },
          {
            value: value2,
            offset: r
          },
          {
            value: value3,
            offset: r
          }
        ]
        return result
      }
    }
  }
  return indicators
}
export default customerMovingAverage
