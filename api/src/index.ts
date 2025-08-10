export default {
   async fetch() {
      const data = {
         hello: 'world',
      }

      return Response.json(data)
   },
} satisfies ExportedHandler;
