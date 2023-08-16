## Turbine with OpenAI

An example data application framework using Turbine and OpenAI's API and Node.js to process data by creating embeddings.

This application listens for incoming data (from a source specified as "pg_db" in this example), and for each record's `shipping_address`, calls OpenAI's API to create an embedding of the text. The application then appends the embedding to each record as a new field, and writes the resulting data to a specified destination.

### Code Walkthrough

The application is comprised of a main class `App` which defines two key methods: `transform` and `run`.

#### Transform

This function processes each input record. It creates embedding of the `shipping_address` field in each record using OpenAI's API. 

```javascript
transform(records) {
    const promises = records.map(record => {
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
```

#### Run

The `run` function is the main driver. It fetches the source and destination resources, fetches the records from the source, processes them using the `transform` method, and writes them to the destination.

```javascript
async run(turbine) {
    let source = await turbine.resources("pg_db");

    let records = await source.records("data");

    let transformed = await turbine.process(records, this.transform);

    let destination = await turbine.resources("destination_name");

    await destination.write(transformed, "collection_archive");
}
```

### Getting Started 

#### 1. Setup Environment Variables

To securely store your OpenAI API key, create a `.env` file at the root of your project directory and add your key like so:

```shell
# .env
OPENAI_API_KEY=your_key_here
```

Then in your application, you can access the API key through `process.env.OPENAI_API_KEY`. 

#### 2. Install Dependencies

To install necessary packages, use npm:

```shell
npm install dotenv openai
```

#### 3. Run Your Application

How to run your application will depend on your specific configuration and what tooling or services you're using to run your application. 

### Testing

Testing should follow standard NodeJS development practices. Included in the repo is a sample jest configuration, but you can use any testing framework you would use to test Node apps.

## Documentation && Reference

The most comprehensive documentation for Turbine and how to work with Turbine apps is on the Meroxa site: [https://docs.meroxa.com/](https://docs.meroxa.com)

## Contributing

Check out the [/docs/](./docs/) folder for more information on how to contribute.
