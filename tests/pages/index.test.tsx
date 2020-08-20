describe('test', function() {
    it('should testss', function() {
        function add(a: number, b: number):number {
            return a+b
        }
        expect(add(2,3)).toEqual(5)
    });
});