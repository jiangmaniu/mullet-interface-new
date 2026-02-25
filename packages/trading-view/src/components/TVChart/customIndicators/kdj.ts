// @ts-nocheck
const KDJ = (tvobj: any) => {
  return {
    name: 'KDJ',
    metainfo: {
      _metainfoVersion: 27,
      id: 'KDJ',
      scriptIdPart: '',
      name: 'KDJ',
      description: 'KDJ',
      shortDescription: 'KDJ',
      isTVScript: !1,
      isTVScriptStub: !1,
      is_hidden_study: !1,
      isCustomIndicator: true,
      is_price_study: !1, //主副指标
      plots: [
        {
          id: 'k',
          type: 'line'
        },
        {
          id: 'd',
          type: 'line'
        },
        {
          id: 'j',
          type: 'line'
        }
      ],
      defaults: {
        styles: {
          k: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: 0,
            trackPrice: false,
            transparency: 40,
            color: '#FF0000'
          },
          d: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: 0,
            trackPrice: false,
            transparency: 40,
            color: '#0000FF'
          },
          j: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: 0,
            trackPrice: false,
            transparency: 40,
            color: '#00ffff'
          }
        },
        precision: 2,
        inputs: {
          N: 9,
          M1: 3,
          M2: 3
        }
      },
      styles: {
        k: {
          title: 'Histogram',
          histogramBase: 0,
          joinPoints: !1
        },
        d: {
          title: 'KDJ',
          histogramBase: 0,
          joinPoints: !1
        },
        j: {
          title: 'Signal',
          histogramBase: 0,
          joinPoints: !1
        }
      },
      inputs: [
        {
          id: 'N',
          name: 'N',
          defval: 9,
          type: 'integer'
        },
        {
          id: 'M1',
          name: 'M1',
          defval: 3,
          type: 'integer'
        },
        {
          id: 'M2',
          name: 'M2',
          defval: 3,
          type: 'integer'
        }
      ]
    },
    constructor: function () {
      // this.init = function (context, inputCallback) {
      //     this._context = context;
      //     this._input = inputCallback;
      //     const symbol = tvobj.Std.ticker(this._context);
      //     this._context.new_sym(symbol, tvobj.Std.period(this._context), tvobj.Std.period(this._context));
      // };

      this.main = function (s, o) {
        let a, b, c, d, e, f, g, h, i, j
        return (
          (this._context = s),
          (this._input = o),
          (a = tvobj.Std.close(this._context)),
          (b = this._context.new_var(tvobj.Std.high(this._context))),
          (c = this._context.new_var(tvobj.Std.low(this._context))),
          (d = tvobj.Std.lowest(c, this._input(0), this._context)),
          (e = tvobj.Std.highest(b, this._input(0), this._context)),
          (f = ((a - d) / (e - d)) * 100),
          (g = this._context.new_var(f)),
          (h = tvobj.Std.rma(g, this._input(1), this._context)),
          (i = tvobj.Std.rma(this._context.new_var(h), this._input(2), this._context)),
          (j = 3 * h - 2 * i),
          [h, i, j]
        )
      }
    }
  }
}
export default KDJ
