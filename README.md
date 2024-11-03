# Altverse

## Project URL
(altverse.link)[https://altverse.link]

## Technical documentation
Please see the (whitepaper)[https://altverse.link/whitepaper.pdf]

## Running site locally 
### With Docker:
```
docker build -t altverse -f site/Dockerfile site
docker run -it -p 3000:3000 altverse
```
### With npm:
```
cd site
npm install && npm run dev
```
Please navigate to (https://localhost:3000)[https://localhost:3000] after running one of the above to see the site.

## Smart contracts
Please see `./contracts`


