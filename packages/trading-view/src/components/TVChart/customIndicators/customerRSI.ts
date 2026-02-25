// @ts-nocheck
const RSI = (tvobj: any) => {
  return {
    name: 'Customer RSI',
    metainfo: {
      _metainfoVersion: 27,
      // isCustomIndicator: true,
      id: 'Customer RSI@tv-basicstudies-1',
      scriptIdPart: '',
      name: 'Customer RSI',
      description: 'Customer RSI',
      shortDescription: 'RSI',
      is_price_study: !1,
      isTVScript: !1,
      isTVScriptStub: !1,
      is_hidden_study: !1,
      plots: [
        {
          id: 'line1',
          type: 'line'
        },
        {
          id: 'line2',
          type: 'line'
        },
        {
          id: 'line3',
          type: 'line'
        }
      ],
      defaults: {
        styles: {
          line1: {
            linestyle: 0,
            linewidth: 1,
            plottype: 0,
            trackPrice: !1,
            transparency: 35,
            visible: !0,
            color: '#ff0000'
          },
          line2: {
            linestyle: 0,
            linewidth: 1,
            plottype: 0,
            trackPrice: !1,
            transparency: 35,
            visible: !0,
            color: '#00ff00'
          },
          line3: {
            linestyle: 0,
            linewidth: 1,
            plottype: 0,
            trackPrice: !1,
            transparency: 35,
            visible: !0,
            color: '#00ffff'
          }
        },
        precision: 4,
        inputs: {
          var1: 6,
          var2: 12,
          var3: 24
        }
      },
      styles: {
        line1: {
          title: 'line1',
          histogramBase: 0,
          joinPoints: !1
        }
      },

      inputs: [
        {
          id: 'var1',
          name: 'var1',
          defval: 6,
          type: 'integer',
          min: 1,
          max: 1e4
        },
        {
          id: 'var2',
          name: 'var2',
          defval: 12,
          type: 'integer',
          min: 1,
          max: 1e4
        },
        {
          id: 'var3',
          name: 'var3',
          defval: 24,
          type: 'integer',
          min: 1,
          max: 1e4
        }
      ]
    },
    constructor: function () {
      ;(this.f_0 = function (e) {
        return tvobj.Std.max(e, 0)
      }),
        (this.f_1 = function (e) {
          return -tvobj.Std.min(e, 0)
        }),
        (this.f_2 = function (e, t) {
          return tvobj.Std.eq(e, 0) ? 100 : tvobj.Std.eq(t, 0) ? 0 : 100 - 100 / (1 + t / e)
        }),
        (this.main = function (e, t) {
          let i, o, r, s, a, l, c, u, h, d, o1, c1, d1, o2, c2, d2
          return (
            (this._context = e),
            (this._input = t),
            (i = tvobj.Std.close(this._context)),
            (o = this._input(0)),
            (r = this._context.new_var(i)),
            (s = tvobj.Std.change(r)),
            (a = this.f_0(s)),
            (l = this._context.new_var(a)),
            (c = tvobj.Std.rma(l, o, this._context)),
            (u = this.f_1(s)),
            (h = this._context.new_var(u)),
            (d = tvobj.Std.rma(h, o, this._context)),
            (o1 = this._input(1)),
            (c1 = tvobj.Std.rma(l, o1, this._context)),
            (d1 = tvobj.Std.rma(h, o1, this._context)),
            (o2 = this._input(2)),
            (c2 = tvobj.Std.rma(l, o2, this._context)),
            (d2 = tvobj.Std.rma(h, o2, this._context)),
            [this.f_2(d, c), this.f_2(d1, c1), this.f_2(d2, c2)]
          )
        })
    }
  }
}
export default RSI
