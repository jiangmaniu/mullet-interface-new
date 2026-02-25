// @ts-nocheck
export const lrs = {
  name: 'Linear Regression Slope',
  metainfo: {
    _metainfoVersion: 41,
    isTVScript: !1,
    isTVScriptStub: !1,
    is_hidden_study: !1,
    is_price_study: !1,
    id: 'Linear Regression Slope@tv-basicstudies-1',
    scriptIdPart: '',
    name: 'Linear Regression Slope',
    description: 'Linear Regression Slope',
    shortDescription: 'Linear Regression Slope',
    plots: [{ id: 'plot_0', type: 'line' }],
    defaults: {
      styles: {
        plot_0: {
          linestyle: 0,
          visible: !0,
          linewidth: 1,
          plottype: 0,
          trackPrice: !1,
          transparency: 0,
          color: '#FF0000'
        }
      },
      precision: 4,
      inputs: { periods: 14 }
    },
    styles: { plot_0: { title: 'Plot' } },
    inputs: [{ id: 'periods', type: 'integer', name: 'Periods' }]
  },
  constructor: function () {
    ;(this.init = function (e, t) {
      ;(this._context = e), (this._input = t), (this.period = this._input(0))
    }),
      (this.linregSlope = function (e, t, i) {
        let n,
          o,
          r,
          s = 0,
          a = 0,
          l = 0,
          c = 0
        for (n = 0; n < t; ++n) (o = e.get(n)), (s += r = t - 1 - n + 1), (a += o), (l += r * r), (c += o * r)
        return (t * c - s * a) / (t * l - s * s)
      }),
      (this.main = function (e, t) {
        let i
        return (
          (this._context = e),
          (this._input = t),
          (i = this._context.new_var(n.Std.close(this._context))),
          [this.linregSlope(i, this.period, 0)]
        )
      })
  }
}

export const MAC = {
  name: 'MA Cross',
  metainfo: {
    _metainfoVersion: 27,
    isTVScript: !1,
    isTVScriptStub: !1,
    is_hidden_study: !1,
    defaults: {
      styles: {
        plot_0: {
          linestyle: 0,
          linewidth: 1,
          plottype: 0,
          trackPrice: !1,
          transparency: 35,
          visible: !0,
          color: '#FF0000'
        },
        plot_1: { linestyle: 0, linewidth: 1, plottype: 0, trackPrice: !1, transparency: 35, visible: !0, color: '#008000' },
        plot_2: { linestyle: 0, linewidth: 4, plottype: 3, trackPrice: !1, transparency: 35, visible: !0, color: '#000080' }
      },
      precision: 4,
      inputs: { in_0: 9, in_1: 26 }
    },
    plots: [
      { id: 'plot_0', type: 'line' },
      { id: 'plot_1', type: 'line' },
      { id: 'plot_2', type: 'line' }
    ],
    styles: {
      plot_0: {
        title: 'Short',
        histogramBase: 0,
        joinPoints: !1
      },
      plot_1: {
        title: 'Long',
        histogramBase: 0,
        joinPoints: !1
      },
      plot_2: { title: 'Crosses', histogramBase: 0, joinPoints: !1 }
    },
    description: 'MA Cross',
    shortDescription: 'MA Cross',
    is_price_study: !0,
    inputs: [
      { id: 'in_0', name: 'Short', defval: 9, type: 'integer', min: 1, max: 2e3 },
      { id: 'in_1', name: 'Long', defval: 26, type: 'integer', min: 1, max: 2e3 }
    ],
    id: 'MA Cross@tv-basicstudies-1',
    scriptIdPart: '',
    name: 'MA Cross'
  },
  constructor: function () {
    ;(this.f_0 = function (e, t) {
      return e ? t : n.Std.na()
    }),
      (this.main = function (e, t) {
        let i, o, r, s, a, l, c, u, h, d
        return (
          (this._context = e),
          (this._input = t),
          (i = this._input(0)),
          (o = this._input(1)),
          (r = n.Std.close(this._context)),
          (s = this._context.new_var(r)),
          (a = n.Std.sma(s, i, this._context)),
          (l = this._context.new_var(r)),
          (u = a),
          (h = c = n.Std.sma(l, o, this._context)),
          (d = n.Std.cross(a, c, this._context)),
          [u, h, this.f_0(d, a)]
        )
      })
  }
}
