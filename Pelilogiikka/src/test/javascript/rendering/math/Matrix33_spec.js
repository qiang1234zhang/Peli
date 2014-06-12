describe('the Matrix33 object', function () {

//Create an easily-removed container for our tests to play in
    beforeEach(function () {
    });
    //Clean it up after each spec
    afterEach(function () {
    });
    //Specs
    describe('Matrix33 tests', function () {
        it('initializes the matrix', function () {
            var testMatrix = new Matrix33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(testMatrix.data[0]).toBe(1);
            expect(testMatrix.data[1]).toBe(2);
            expect(testMatrix.data[2]).toBe(3);
            expect(testMatrix.data[3]).toBe(4);
            expect(testMatrix.data[4]).toBe(5);
            expect(testMatrix.data[5]).toBe(6);
            expect(testMatrix.data[6]).toBe(7);
            expect(testMatrix.data[7]).toBe(8);
            expect(testMatrix.data[8]).toBe(9);
        });
        it('calculates the identity matrix', function () {
            var testMatrix = new Matrix33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            testMatrix.Identity();
            expect(testMatrix.data[0]).toBe(1);
            expect(testMatrix.data[1]).toBe(0);
            expect(testMatrix.data[2]).toBe(0);
            expect(testMatrix.data[3]).toBe(0);
            expect(testMatrix.data[4]).toBe(1);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[6]).toBe(0);
            expect(testMatrix.data[7]).toBe(0);
            expect(testMatrix.data[8]).toBe(1);
        });
        it('calculates rotation x', function () {
            var testMatrix = new Matrix33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            testMatrix.RotationX(1);
            expect(testMatrix.data[0]).toBe(1);
            expect(testMatrix.data[1]).toBe(0);
            expect(testMatrix.data[2]).toBe(0);
            expect(testMatrix.data[3]).toBe(0);
            expect(testMatrix.data[4]).toBe(0.5403023058681398);
            expect(testMatrix.data[5]).toBe(0.8414709848078965);
            expect(testMatrix.data[6]).toBe(0);
            expect(testMatrix.data[7]).toBe(-0.8414709848078965);
            expect(testMatrix.data[8]).toBe(0.5403023058681398);
        });
        it('calculates rotation y', function () {
            var testMatrix = new Matrix33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            testMatrix.RotationY(1);
            expect(testMatrix.data[0]).toBe(0.5403023058681398);
            expect(testMatrix.data[1]).toBe(0);
            expect(testMatrix.data[2]).toBe(-0.8414709848078965);
            expect(testMatrix.data[3]).toBe(0);
            expect(testMatrix.data[4]).toBe(1);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[6]).toBe(0.8414709848078965);
            expect(testMatrix.data[7]).toBe(0);
            expect(testMatrix.data[8]).toBe(0.5403023058681398);
        });
        it('calculates rotation z', function () {
            var testMatrix = new Matrix33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            testMatrix.RotationZ(1);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[2]).toBe(0);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[6]).toBe(0);
            expect(testMatrix.data[7]).toBe(0);
            expect(testMatrix.data[8]).toBe(1);
        });
        it('calculates scaling', function () {
            var testVector = new Vector3(1, 2, 3);
            var testMatrix = new Matrix33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            testMatrix.Scale(testVector);
            expect(testMatrix.data[0]).toBe(1);
            expect(testMatrix.data[1]).toBe(0);
            expect(testMatrix.data[2]).toBe(0);
            expect(testMatrix.data[3]).toBe(0);
            expect(testMatrix.data[4]).toBe(2);
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[6]).toBe(0);
            expect(testMatrix.data[7]).toBe(0);
            expect(testMatrix.data[8]).toBe(3);
        });
        it('multiplies two matrices', function () {
            var testMatrix = new Matrix33([1, 2, 3, 1, 2, 3, 1, 2, 3]);
            var testMatrix2 = new Matrix33([1, 1, 1, 2, 2, 2, 3, 3, 3]);
            testMatrix.Scale(testMatrix2);
            expect(testMatrix.data[0]).not.toBeNull;
            expect(testMatrix.data[1]).toBe(0);
            expect(testMatrix.data[2]).toBe(0);
            expect(testMatrix.data[3]).toBe(0);
            expect(testMatrix.data[4]).not.toBeNull;
            expect(testMatrix.data[5]).toBe(0);
            expect(testMatrix.data[6]).toBe(0);
            expect(testMatrix.data[7]).toBe(0);
            expect(testMatrix.data[8]).not.toBeNull;
        });
        it('transforms', function () {
            var testVector = new Vector3(1, 2, 3);
            var testMatrix = new Matrix33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            var result = testMatrix.Scale(testVector);
            expect(result).not.tobeNull;
        });
        it('extracts the row I', function () {
            var testMatrix = new Matrix33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            var result = testMatrix.extract_I();
            expect(result.x).toBe(1);
            expect(result.y).toBe(2);
            expect(result.z).toBe(3);
        });
        it('extracts the row J', function () {
            var testMatrix = new Matrix33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            var result = testMatrix.extract_J();
            expect(result.x).toBe(4);
            expect(result.y).toBe(5);
            expect(result.z).toBe(6);
        });
        it('extracts the row K', function () {
            var testMatrix = new Matrix33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            var result = testMatrix.extract_K();
            expect(result.x).toBe(7);
            expect(result.y).toBe(8);
            expect(result.z).toBe(9);
        });
    });
});