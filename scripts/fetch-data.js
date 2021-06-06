const fetch = require('node-fetch');
const fs = require('fs');
const yaml = require('js-yaml');
const dataUrl = 'https://covid.ourworldindata.org/data/owid-covid-data.json';

fetch(dataUrl)
    .then((resp) => resp.json())
    .then((json) => {
        Object.entries(json).forEach(([country, { data = [] }]) => {
            if (data.length === 0 || country.length !== 3) {
                return;
            }
            fs.writeFileSync(
                `${__dirname}/../static/${country}.yml`,
                yaml.dump(data)
            );
        });
        return json;
    })
    .then((data) => {
        const nameSource = data;
        const countryNames = Object.keys(nameSource).filter((country) => country.length === 3);
        const timeseries = {};
        const countries = {};
        countryNames.forEach((country) => {
            countries[country] = { values: [], timeseries: [], total_cases: -1 };
            if (data[country]) {
                Object.keys(data[country]).forEach((key) => {
                    if (key === 'data') return;
                    countries[country].values.push(key);
                });
            }
            if (Array.isArray(data[country]?.data)) {
                data[country].data.forEach((point) => {
                    Object.keys(point).forEach((key) => {
                        if (key === 'date') return;
                        if (key === 'total_cases') {
                            countries[country].total_cases = point.total_cases;
                        }
                        if (!(key in timeseries)) {
                            timeseries[key] = [country];
                        } else if (!timeseries[key].includes(country)) {
                            timeseries[key].push(country);
                        }
                        if (!countries[country].timeseries.includes(key)) {
                            countries[country].timeseries.push(key);
                        }
                    });
                });
            }
        });
        fs.writeFileSync(
            `${__dirname}/../static/meta.yml`,
            yaml.dump(
                {
                    timeseries,
                    countries,
                }
            )
        );
    })
    .then(() => {
        fs.writeFileSync(
            `${__dirname}/../static/lastUpdated.yml`,
            yaml.dump({ timestamp: new Date().getTime() })
        );
    });
