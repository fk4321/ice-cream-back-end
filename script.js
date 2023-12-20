const pg = require('pg')
//make connection to db
const client = new pg.Client('postgress://localhost/ice_cream_db')
const express = require('express')
app = express()
const cors = require('cors')

app.use(cors())

app.get('/', (req, res, next) => {
    res.send('Hello World')
})

//get all the ice-creams
app.get('/api/ice', async(req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM ice;
        `
        console.log('In db!')

        const response = await client.query(SQL)
        console.log(response)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

//get one ice-cream
app.get('/api/ice/:id', async(req, res, next) => {
    try {
        console.log(req.params.id)

        const SQL = `
        SELECT * FROM ice WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])

        if(!response.rows.length){
            next({
                name: "id error",
                message: `ice-cream with ${req.params.id} not found`
            })
        }else{
            res.send(response.rows[0])
        }

    } catch (error) {
        next (error)
    }
})

// delete ice-cream 
app.delete('api/ice/:id', async (req,res,next) => {
    try {
        const SQL =`
        DELETE FROM ice WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

//error handler when unavailable ice-cream is searched 
app.use((error,req,res,next) => {
    res.status(500)
    res.send(error)
})

//error handler for all other errors
app.use('*', (req,res,next) => {
    res.send("No such route Exits")
})

const init = async () => {
    await client.connect()
    console.log('Connected to db!') 

    // create table 
    const SQL = `
    DROP TABLE IF EXISTS ice;
    CREATE TABLE ice (
        id SERIAL PRIMARY KEY,
        name VARCHAR(25)
    );
    INSERT INTO ice(name) VALUES ('vanilla');
    INSERT INTO ice(name) VALUES ('chocolate');
    INSERT INTO ice(name) VALUES ('blueberry');
    INSERT INTO ice(name) VALUES ('vanilla-mix');
    INSERT INTO ice(name) VALUES ('vanilla-felix');
    INSERT INTO ice(name) VALUES ('vanilla-biwott');
    `

    //tell client to update db
    await client.query(SQL)
    console.log('ice table created')

    // ask app to listen at port 
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`server listening at port: ${port}`)
    })
}

init()
