import cockpit from "cockpit";
import QUnit from "qunit-tests";

QUnit.test("load user info", function (assert) {
    const done = assert.async();
    assert.expect(9);

    const dbus = cockpit.dbus(null, { bus: "internal" });
    dbus.call("/user", "org.freedesktop.DBus.Properties",
              "GetAll", ["cockpit.User"],
              { type: "s" })
            .done(function(reply) {
                const user = reply[0];
                assert.ok(user.Name !== undefined, "has Name");
                assert.equal(user.Name.t, "s", "string Name");
                assert.ok(user.Full !== undefined, "has Full name");
                assert.equal(user.Full.t, "s", "string Full");
                assert.ok(user.Shell !== undefined, "has Shell");
                assert.equal(user.Home.t, "s", "type Home");
                assert.equal(user.Home.v.indexOf("/"), 0, "Home starts with slash");
                assert.equal(user.Groups.t, "as", "type Groups");
            })
            .always(function() {
                assert.equal(this.state(), "resolved", "finished successfully");
                done();
            });
});

QUnit.test("user object", function (assert) {
    const done = assert.async();
    assert.expect(6);

    cockpit.user().done(function (user) {
        assert.equal(typeof user.name, "string", "user name");
        assert.equal(typeof user.full_name, "string", "user full name");
        assert.equal(typeof user.shell, "string", "user shell");
        assert.equal(typeof user.home, "string", "user home");
        assert.equal(typeof user.id, "number", "user id");
        assert.ok(Array.isArray(user.groups), "user groups");
        done();
    });
});

QUnit.test("user environment", function (assert) {
    const done = assert.async();
    assert.expect(6);

    cockpit.spawn(["/bin/sh", "-c", "echo $USER~$SHELL~$HOME"])
            .done(function(data) {
                const parts = data.split("~");
                assert.ok(parts[0].length > 0, "valid $USER");
                assert.ok(parts[1].length > 0, "valid $HOME");
                assert.equal(parts[1].indexOf("/"), 0, "$HOME starts with slash");
                assert.ok(parts[2].length > 0, "valid $SHELL");
                assert.equal(parts[1].indexOf("/"), 0, "$SHELL starts with slash");
            })
            .fail(function(ex) {
                console.warn(ex);
            })
            .always(function() {
                assert.equal(this.state(), "resolved", "finished successfully");
                done();
            });
});

QUnit.start();
