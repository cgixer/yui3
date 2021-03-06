YUI.add('event-valuechange-test', function (Y) {

var Assert      = Y.Assert,
    ArrayAssert = Y.ArrayAssert,

    ignoreFocus = Y.UA.ie && Y.UA.ie < 10,
    suite       = new Y.Test.Suite('Y.ValueChange');

// -- Basic Subscriptions ------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Basic',

    _should: {
        ignore: {
            // IE doesn't simulate focus/blur events properly, so these tests
            // fail. Have to rely on manual testing.
            'valuechange should stop polling on blur': ignoreFocus,
            'valuechange should start polling on focus': ignoreFocus,
            'valuechange should not report stale changes that occurred while a node was not focused': ignoreFocus
        }
    },

    setUp: function () {
        this.textArea  = Y.Node.create('<textarea></textarea>');
        this.textInput = Y.Node.create('<input type="text">');

        Y.one('#test').append(this.textArea)
            .append(this.textInput);
    },

    tearDown: function () {
        this.textArea.remove().destroy(true);
        this.textInput.remove().destroy(true);
    },

    'valuechange event should start polling on mousedown and fire an event when the value changes': function () {
        var fired;

        this.textInput.once('valuechange', function (e) {
            fired = true;

            Assert.areSame('', e.prevVal);
            Assert.areSame('foo', e.newVal);
        });

        this.textInput.simulate('mousedown');
        this.textInput.set('value', 'foo');

        this.wait(function () {
            Assert.isTrue(fired);
        }, 60);
    },

    'valuechange should support textareas as well': function () {
        var fired;

        this.textArea.once('valuechange', function (e) {
            fired = true;

            Assert.areSame('', e.prevVal);
            Assert.areSame('foo', e.newVal);
        });

        this.textArea.simulate('mousedown');
        this.textArea.set('value', 'foo');

        this.wait(function () {
            Assert.isTrue(fired);
        }, 60);
    },

    'valuechange should start polling on keydown': function () {
        var fired;

        this.textInput.once('valuechange', function (e) {
            fired = true;
        });

        this.textInput.simulate('keydown');
        this.textInput.set('value', 'foo');

        this.wait(function () {
            Assert.isTrue(fired);
        }, 60);
    },

    'valuechange should stop polling on blur': function () {
        var fired;

        this.textInput.on('valuechange', function (e) {
            fired = true;
        });

        this.textInput.simulate('mousedown');
        this.textInput.set('value', 'foo');

        this.wait(function () {
            Assert.isTrue(fired);
            fired = false;

            this.textInput.simulate('blur');
            this.textInput.set('value', 'bar');

            this.wait(function () {
                Assert.isFalse(fired);
            }, 60);
        }, 60);
    },

    'valuechange should start polling on focus': function () {
        var fired;

        this.textInput.once('valuechange', function (e) {
            fired = true;
        });

        this.textInput.simulate('focus');
        this.textInput.set('value', 'foo');

        this.wait(function () {
            Assert.isTrue(fired);
        }, 60);
    },

    'valuechange should not report stale changes that occurred while a node was not focused': function () {
        var fired = false;

        this.textInput.simulate('mousedown');
        this.textInput.set('value', 'foo');

        this.textInput.on('valuechange', function (e) {
            fired = true;
        });

        this.textInput.simulate('blur');
        this.textInput.set('value', 'bar');
        this.textInput.simulate('focus');
        this.textInput.simulate('mousedown');

        this.wait(function () {
            Assert.isFalse(fired);
        }, 60);
    },

    'valuechange should start polling on keyup for IME keystrokes': function () {
        var fired = false;

        this.textInput.on('valuechange', function (e) {
            fired = true;
        });

        this.textInput.simulate('keyup', {keyCode: 123}); // should not trigger IME behavior
        this.textInput.set('value', 'foo');

        this.wait(function () {
            Assert.isFalse(fired);

            this.textInput.simulate('blur'); // stop polling
            this.textInput.simulate('keyup', {keyCode: 197});
            this.textInput.set('value', 'bar');

            this.wait(function () {
                Assert.isTrue(fired);

                fired = false;

                this.textInput.simulate('blur');
                this.textInput.simulate('keyup', {keyCode: 229});
                this.textInput.set('value', 'baz');

                this.wait(function () {
                    Assert.isTrue(fired);
                }, 100);
            }, 100);
        }, 100);
    },

    'valuechange should stop polling after timeout': function () {
        var oldTimeout = Y.ValueChange.TIMEOUT,
            fired;

        this.textInput.on('valuechange', function (e) {
            fired = true;
        });

        Y.ValueChange.TIMEOUT = 70;

        this.textInput.simulate('mousedown');
        this.textInput.set('value', 'foo');

        this.wait(function () {
            Assert.isTrue(fired);
            fired = false;

            this.wait(function () {
                this.textInput.set('value', 'bar');

                this.wait(function () {
                    Assert.isFalse(fired);
                    Y.ValueChange.TIMEOUT = oldTimeout;
                }, 60);
            }, 71);
        }, 60);
    },

    'valueChange should be an alias for valuechange for backcompat': function () {
        var fired;

        this.textInput.on('valueChange', function () {
            fired = true;
        });

        this.textInput.simulate('mousedown');
        this.textInput.set('value', 'monkeys');

        this.wait(function () {
            Assert.isTrue(fired, 'valueChange event should have fired');
        }, 60);
    }
}));

// -- Delegation ---------------------------------------------------------------

suite.add(new Y.Test.Case({
    name: 'Delegation',

    setUp: function () {
        this.container = Y.one('#test')
            .append('<input type="text" id="vc-delegate-a" class="odd">')
            .append('<input type="text" id="vc-delegate-b" class="even">')
            .append('<input type="text" id="vc-delegate-c" class="odd">')
            .append('<textarea id="vc-delegate-d" class="even"></textarea>')
            .append('<textarea id="vc-delegate-e" class="odd"></textarea>')
            .append('<textarea id="vc-delegate-f" class="even"></textarea>');

        this.a = Y.one('#vc-delegate-a');
        this.b = Y.one('#vc-delegate-b');
        this.c = Y.one('#vc-delegate-c');
        this.d = Y.one('#vc-delegate-d');
        this.e = Y.one('#vc-delegate-e');
        this.f = Y.one('#vc-delegate-f');
    },

    tearDown: function () {
        this.container.purge().empty();
    },

    'delegation should be supported on input nodes': function () {
        var test = this;

        this.container.delegate('valuechange', function (e) {
            test.resume(function () {
                Assert.areSame('', e.prevVal);
                Assert.areSame('foo', e.newVal);
            });
        }, '.odd');

        this.a.simulate('mousedown');
        this.a.set('value', 'foo');

        this.wait(100);
    },

    'delegation should be supported on textareas': function () {
        var test = this;

        this.container.delegate('valuechange', function (e) {
            test.resume(function () {
                Assert.areSame('', e.prevVal);
                Assert.areSame('foo', e.newVal);
            });
        }, '.even');

        this.f.simulate('mousedown');
        this.f.set('value', 'foo');

        this.wait(100);
    },

    'delegate filters should work properly': function () {
        var test = this;

        this.container.delegate('valuechange', function (e) {
            test.resume();
        }, '.even');

        this.container.delegate('valuechange', function (e) {
            test.resume(function () {
                Assert.fail('.odd handler should not be called');
            });
        }, '.odd');

        this.b.simulate('mousedown');
        this.b.set('value', 'foo');

        this.wait(100);
    },

    'multiple delegated handlers should be supported': function () {
        var calls = [],
            test  = this;

        this.container.delegate('valuechange', function (e) {
            calls.push('one');
        }, '.odd');

        this.container.delegate('valuechange', function (e) {
            test.resume(function () {
                Assert.fail('.even handler should not be called');
            });
        }, '.even');

        this.container.delegate('valuechange', function (e) {
            calls.push('two');
        }, '.odd,.even');

        this.container.delegate('valuechange', function (e) {
            calls.push('three');
        }, 'input');

        this.c.simulate('mousedown');
        this.c.set('value', 'foo');

        this.wait(function () {
            ArrayAssert.itemsAreSame(['one', 'two', 'three'], calls, 'delegated handlers should all be called in the correct order');
        }, 100);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {requires:['event-valuechange', 'node-base', 'node-event-simulate', 'test']});
