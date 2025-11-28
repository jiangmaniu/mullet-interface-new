'use client'

import { Chart, Series } from '@highcharts/react'
import { useMemo } from 'react'

interface DepthChartProps {
  bids: [number, number][] // [price, quantity]
  asks: [number, number][] // [price, quantity]
}

export default function DepthChart({ bids, asks }: DepthChartProps) {
  // 处理深度数据：计算累积量
  const depthData = useMemo(() => {
    // 买单：从高到低排序，然后计算累积量
    const sortedBids = [...bids].sort((a, b) => b[0] - a[0]) // 价格从高到低
    let cumulativeBidQty = 0
    const bidsDepth = sortedBids.map(([price, qty]) => {
      cumulativeBidQty += qty
      return [price, cumulativeBidQty]
    })

    // 卖单：从低到高排序，然后计算累积量
    const sortedAsks = [...asks].sort((a, b) => a[0] - b[0]) // 价格从低到高
    let cumulativeAskQty = 0
    const asksDepth = sortedAsks.map(([price, qty]) => {
      cumulativeAskQty += qty
      return [price, cumulativeAskQty]
    })

    return {
      bidsDepth: bidsDepth.reverse(), // 反转以便从左到右显示
      asksDepth,
    }
  }, [bids, asks])

  // 计算中间价格（用于绘制分界线）
  const midPrice = useMemo(() => {
    if (bids.length > 0 && asks.length > 0) {
      const highestBid = Math.max(...bids.map((b) => b[0]))
      const lowestAsk = Math.min(...asks.map((a) => a[0]))
      return (highestBid + lowestAsk) / 2
    }
    return 0
  }, [bids, asks])

  return (
    <Chart
      containerProps={{ style: { height: '100%', width: '100%' } }}
      options={{
        chart: {
          type: 'area',
          zooming: {
            type: 'xy',
          },
          backgroundColor: 'transparent',
        },
        title: {
          text: undefined,
        },
        xAxis: {
          minPadding: 0,
          maxPadding: 0,
          plotLines: midPrice
            ? [
                {
                  color: '#888',
                  value: midPrice,
                  width: 1,
                },
              ]
            : [],

          labels: {
            formatter: function () {
              return String(this.value)
            },
          },
        },
        yAxis: [
          {
            lineWidth: 1,
            gridLineWidth: 1,
            title: {
              text: undefined,
            },
            tickWidth: 1,
            tickLength: 5,
            tickPosition: 'inside',
            labels: {
              align: 'left',
              x: 8,
            },
          },
          {
            opposite: true,
            linkedTo: 0,
            lineWidth: 1,
            gridLineWidth: 0,
            title: undefined,
            tickWidth: 1,
            tickLength: 5,
            tickPosition: 'inside',
            labels: {
              align: 'right',
              x: -8,
            },
          },
        ],
        legend: {
          enabled: false,
        },
        plotOptions: {
          area: {
            fillOpacity: 0.2,
            lineWidth: 1,
            step: 'center',
            marker: {
              enabled: false,
            },
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size: 10px">Price: {point.key}</span><br/>',
          pointFormat: '{series.name}: <b>{point.y}</b>',
          valueDecimals: 2,
        },
        credits: {
          enabled: false,
        },
        series: [
          {
            type: 'area',
            name: 'Bids',
            data: depthData.bidsDepth,
            color: '#03a7a8',
          },
          {
            type: 'area',
            name: 'Asks',
            data: depthData.asksDepth,
            color: '#fc5857',
          },
        ],
      }}
    />
  )
}
