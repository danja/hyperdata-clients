// spec/base-client.spec.js
import { expect } from 'chai';
import { AIClient, AIError } from '../src/base-client.js';

describe('AIClient', () => {
    class TestClient extends AIClient {}

    it('should prevent instantiation of abstract class', () => {
        expect(() => new AIClient()).to.throw('Cannot instantiate abstract class');
    });

    it('should allow instantiation of concrete implementations', () => {
        expect(() => new TestClient()).not.to.throw();
    });

    it('should require implementation of abstract methods', async () => {
        const client = new TestClient();
        await expect(client.chat([])).to.be.rejectedWith('Method chat() must be implemented');
        await expect(client.complete('')).to.be.rejectedWith('Method complete() must be implemented');
        await expect(client.embedding('')).to.be.rejectedWith('Method embedding() must be implemented');
        await expect(client.stream([], () => {})).to.be.rejectedWith('Method stream() must be implemented');
    });
});

describe('AIError', () => {
    it('should create error with provider and code', () => {
        const error = new AIError('Test error', 'test-provider', 'ERROR_CODE');
        expect(error.message).to.equal('Test error');
        expect(error.provider).to.equal('test-provider');
        expect(error.code).to.equal('ERROR_CODE');
    });
});
