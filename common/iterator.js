module.exports =
    function(data) {
        return {
            data: data,
            index: 0,
            next: function() {
                return this.data[this.index++]
            },
            hasNext: function() {
                return this.index < this.data.length
            }
        };
    };
