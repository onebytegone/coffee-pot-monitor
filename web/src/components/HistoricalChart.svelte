<script lang="ts">
   import { getHistoryAPI } from '../lib/context';
   import { onMount } from 'svelte';
   import Chart from 'chart.js/auto';
   import 'chartjs-adapter-luxon';

   const { dataPoints } = getHistoryAPI();

   let canvas: HTMLCanvasElement;

   const chartData = $derived($dataPoints.map(dp => {
      return { x: dp.timestamp * 1000, y: dp.ouncesAvailable };
   }));

   onMount(() => {
      const ctx = canvas.getContext('2d');

      if (ctx) {
         const chart = new Chart(ctx, {
            type: 'line',
            data: {
               datasets: [
                  {
                     fill: true,
                     borderColor: 'rgb(98, 82, 70)',
                     backgroundColor: 'rgba(98, 82, 70, 0.6)',
                     label: 'Ounces Available',
                     pointRadius: 0,
                     data: chartData,
                  },
               ],
            },
            options: {
               animation: false,
               plugins: {
                  legend: { display: false },
               },
               scales: {
                  x: {
                     type: 'timeseries',
                     time: {
                        unit: 'hour',
                     }
                  },
                  y: {
                     min: 0,
                     max: 68,
                     ticks: {
                        stepSize: 4,
                        callback: (val) => { return val + 'oz'; },
                     },
                  }
               }
            }
         });

         $effect(() => {
            chart.data.datasets[0].data = chartData;
            chart.update();
         });
      }
   });
</script>

<div class="chart-container">
   <canvas bind:this={canvas}></canvas>
</div>

<style>
   .chart-container {
      width: 100%;
   }
</style>
