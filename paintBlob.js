/*  paintBlob.js : javascript for paintBlob3.html
 * 
 *   Dan L. Wilder, 4 February 2016
 *
 *   Group Members: 
 *      - Abdullah Aldossary
 *      - Richard Chaidex
 *      - Alex Kappelmann      
 *         - Myself (Dan Wilder)
 *   
 *   Objectives:
 *        1) Grab input from web page
 *        2) Perform the actual processing as per project specifications
 *        3) Show results cleanly back to webpage
 *
 *     Uses jQuery to achieve results.       
 */

var totalStatRuns = 0;

// jQuery - make sure document is ready before modifying
$(document).ready(function(){

    // Hide table initially
    $("#result-table").hide();

    // Main iteraction between user and code.
    $("#user-btn").click(function() {

        // Grab input from user
        row = Number($("#rowInput").val());
        col = Number($("#colInput").val());
        runs = Number($("#runInput").val());

        // Proceed only on valid input
        if (isValid(row, col, runs)) {

            // Clear existing table
            $("#result-body").html("");

            // Disable input fields until done processing
            $("input").prop('disabled', true);

            // Create a new interface to get the statistics
            var stats = new PaintBlobStats(row, col);

            // Update status line and reveal (empty) table
            $("#status").html("Processing...");
            $("#result-table").show();

            // Loop for number of runs 
            for(var i = 0; i < runs; ++i) {

                // Perform single paintblob simulation;
                // Automatically updates and stores results internally 
                stats.nextRun();

                // Success run -> Add row to table
                if(stats.recentTerminate == false) {
                    $("#result-body").append(
                        '<tr><td>'+(i+1)+'</td><td>'+stats.recentBlobs+'</td><td>'+stats.recentDeep+'</td></tr>'
                    );
                }

                // Run ended prematurely -> Add row to table indicating this
                else {
                    $("#result-body").append(
                        '<tr><td>'+(i+1)+'</td>'+'<td>N/A</td>'+'<td>N/A</td></tr>'
                    );
                }
            }

            // Add overall statistics to the table
            $("#result-body").append(
                '<tr><th colspan="3">Overall Statistics</th></tr>'+
                '<tr><th colspan="2">Success Runs</th><td>'+stats.completedRuns+'</td></tr>'+
                '<tr><th>/</th><th>Paintblobs</th><th>Depth</th></tr>'+
                '<tr><th>Min</th><td>'+stats.minBlobs+'</td>'+'<td>'+stats.minDeep+'</td></tr>'+
                '<tr><th>Mean</th><td>'+stats.meanBlobs+'</td>'+'<td>'+stats.meanDeep+'</td></tr>'+
                '<tr><th>Max</th><td>'+stats.maxBlobs+'</td>'+'<td>'+stats.maxDeep+'</td></tr>'
            );
            
            // Completed entire run; update status line
            $("#status").html("Completed job #" + ++totalStatRuns);

            // Enable input fields for next job
            $("input").prop('disabled', false);
        }

        // Bad input; hide result table and update status line
        else {
            $("#result-table").hide();
            $("#status").html("Bad input! Enter whole numbers between 1 and 100");
        }
    });

    // Nice touch when input boxes gain/lose focus
    $("input").focus(function(){
        $(this).css("background-color", "#aaaaaa");
    });
    $("input").blur(function(){
        $(this).css("background-color", "#ffffff");
    });
});

// Returns true if each parameter is integer in [1, 100]
function isValid(a, b, c) {
    if (isInt(a) && isInt(b) && isInt(c))
        if (a >= 1 && a <= 100 && b >= 1 && b <= 100 && c >= 1 && c <= 100)
            return true;
    return false;
}

// Borrowed from Stack overflow
function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

// Create object to keep track of statistics (use new keyword)
function PaintBlobStats(rows, cols) {
/*  Internal code will set variables; Outside code should 
 *  only use their values - not set
 */

    // Grid dimensions to use when gathering statistics
    this.numRows = rows;
    this.numCols = cols;

    // Limit on how long a single simulation can run for
    // Lower limit set regardless of dimensions.
    generalFunc = Math.pow(this.numRows*this.numCols, 2);
    this.runLimit = (generalFunc >= 1000) ? generalFunc : 1000; 

    // Record of overall statistics
    this.completedRuns = 0;

    this.maxDeep = 0;
    this.minDeep = 0;
    this.meanDeep = 0;

    this.maxBlobs = 0;
    this.minBlobs = 0;
    this.meanBlobs = 0;

    // Most recent run stats;
    this.recentBlobs = 0;
    this.recentDeep = 0;
    this.recentTerminate = false;

    // Method for outside code to call
    this.nextRun = nextRun;

    // Intended for use within nextRun ONLY
    this.updateStats = updateStats;

    // One paintblob simulation; update statistics on the fly
    function nextRun() {

        // Create new grid
        var grid = new Grid(this.numRows, this.numCols);
        this.recentTerminate = false;

        // Loop until everything painted OR run limit reached
        for (var i = 0; grid.numUniquePainted < grid.numCells; ++i) {

            // run limit reached
            if (i >= this.runLimit) {
                this.recentTerminate = true;
                break;
            }

            // Pick random coordinates
            var row = Math.floor(Math.random() * this.numRows);
            var col = Math.floor(Math.random() * this.numCols);

            // Add paint
            grid.addPaint(row, col);
        }

        if (!this.recentTerminate) 
            this.updateStats(i, grid.highestDepth);
    }

    function updateStats(blobs, depth) {

        // Function always called at end of a run
        this.completedRuns += 1;

        this.recentBlobs = blobs;
        this.recentDeep = depth;

        // First run so just copy values
        if (this.completedRuns == 1) {
            this.maxBlobs = blobs;
            this.minBlobs = blobs;
            this.meanBlobs = blobs;

            this.maxDeep = depth;
            this.minDeep = depth;
            this.meanDeep = depth;
        }

        // 2nd or greater run; compare to previous values
        else {
            this.maxBlobs = (blobs > this.maxBlobs) ? blobs : this.maxBlobs;
            this.minBlobs = (blobs < this.minBlobs) ? blobs : this.minBlobs;
            this.meanBlobs = ((this.meanBlobs * (this.completedRuns - 1)) + blobs) / this.completedRuns;

            this.maxDeep = (depth > this.maxDeep) ? depth : this.maxDeep;
            this.minDeep = (depth < this.minDeep) ? depth : this.minDeep;
            this.meanDeep = ((this.meanDeep * (this.completedRuns - 1)) + depth) / this.completedRuns;

            // Decimal precison to 2 places
            this.meanBlobs = Math.round(this.meanBlobs * 100) / 100;
            this.meanDeep = Math.round(this.meanDeep * 100) / 100;
        }
    }
}

// Create object to keep track of paintblob grid (use new keyword)
function Grid(rows, cols) {
    this.numCells = rows * cols;
    this.cells = [];
    this.highestDepth = 0;
    this.numUniquePainted = 0;
    this.addPaint = addPaint;

    // Create new cells in 2d array
    for (var i = 0; i < rows; i++) {
        this.cells[i] = [];
        for (var j=0; j < cols; j++) {
            this.cells[i][j] = 0;
        }
    }

    // Paints the cell in grid
    function addPaint(row, col) {
      
        // if originally not painted:
        if (this.cells[row][col] == 0)
            this.numUniquePainted += 1;

        // Increase selected cell's depth by 1
        this.cells[row][col] += 1;

        // Check if new highest depth
        if (this.cells[row][col] > this.highestDepth)
            this.highestDepth = this.cells[row][col];
    }
}
