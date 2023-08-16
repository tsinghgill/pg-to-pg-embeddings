require('dotenv').config()
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function createEmbedding(openai, data) {
  return new Promise((resolve, reject) => {
    openai
      .createEmbedding(data)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}

exports.App = class App {
  transform(records) {
    const promises = records.map(record => {
      // let payload = record.value.payload.after;
      
      //call the createEmbedding function
      return createEmbedding(openai, {
          model: 'text-embedding-ada-002',
          input: record.get("shipping_address"),
        })
        .then(embeddingResponse => {
          const [{ embedding }] = embeddingResponse.data.data;
    
          record.set('embedding', embedding);
    
          return record;
        });
    });

    return Promise.all(promises);
  }

  async run(turbine) {
    let source = await turbine.resources("pg_db");

    let records = await source.records("data");

    let transformed = await turbine.process(records, this.transform);

    let destination = await turbine.resources("destination_name");

    await destination.write(transformed, "collection_archive");
  }
};
