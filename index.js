#!/usr/bin/env node

var cmd = require('commander')
var Election = require('caritat').Election
var condorcet = require('caritat').condorcet
var borda = require('caritat').borda
var fs = require('fs')
var csv = require('csv-reader')
var _ = require('lodash')

cmd
  .arguments('<file> <candidates>')
  .action(function (file, candidates) {
    const election = new Election({
      candidates: candidates.split(',')
    })
    fs.createReadStream(file, 'utf8')
      .pipe(csv({ parseNumbers: false }))
      .on('data', function (row) {
        console.log(row)
        try {
          var votes = _.filter(_.tail(row), function (vote) { return !_.isEmpty(vote) })
          console.log(votes)
          election.addBallot(votes)
        } catch (err) {
          console.log(err)
          console.log(row)
        }
      })
      .on('end', function (data) {
        var winners = condorcet.schulze(election, {
          log: console.log,
          seats: candidates.length
        })
        var bordaWinners = borda(election)
        console.log('Condorcet-Schulze')
        console.log(winners)
        console.log('Borda')
        console.log(bordaWinners)
      }).on('error', function (err) {
        console.log(err)
      })
  })
  .parse(process.argv)
