import ivy
import shortcodes
import util

@shortcodes.register("config")
def glossary_ref(pargs, kwargs, node):
    """Handle [% config name %] references to configuration values."""
    util.require(
        (len(pargs) == 1) and (not kwargs), f"Bad 'config' shortcode {pargs} and {kwargs}"
    )
    key = pargs[0]
    if key == "email":
        assert key in ivy.site.config, f"No email address in configuration"
        email = ivy.site.config["email"]
        return f'<a href="mailto:{email}" class="email">{email}</a>'
    assert False, f"Unknown 'config' key {key}"
